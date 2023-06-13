import fs from "fs";
import yaml from "js-yaml";
import { compileFromFile } from "json-schema-to-typescript";
import { generateName } from "json-schema-to-typescript/dist/src/utils.js";
import path from "path";
import { Project } from "ts-morph";
import { fileURLToPath } from "url";
import { z } from "zod";

const project = new Project({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yamlFiles = findFiles(path.join(__dirname, "../assets/policies"), [
  ".yaml",
  ".yml",
]);

const schemaFiles = findFiles(path.join(__dirname, "../assets/_schemas"), [
  ".json",
]);

// Zod Schema to validate Resource Policy YAML Files
const yamlSchema = z.object({
  resourcePolicy: z.object({
    resource: z.string(),
    rules: z.array(z.object({ actions: z.array(z.string()) })),
    schemas: z.optional(
      z.object({
        principalSchema: z.optional(z.object({ ref: z.string() })),
        resourceSchema: z.optional(z.object({ ref: z.string() })),
      })
    ),
  }),
});

const outSourceFile = project.createSourceFile("cerbos.d.ts", "", {
  overwrite: true,
});

outSourceFile.addImportDeclaration({
  moduleSpecifier: "@cerbos/core/lib/types/external",
  isTypeOnly: true,
  namedImports: ["Principal", "IsAllowedRequest"],
});

const cerbosModule = outSourceFile.addModule({ name: '"@cerbos/http"' });

const httpInterface = cerbosModule.addInterface({
  name: "HTTP",
});

// parse all schemas and add them to the source file as interfaces
await Promise.all(
  schemaFiles.map(async (filePath) => {
    const schema = await compileFromFile(filePath);
    const file = project.createSourceFile("", schema);
    const createdInterfaces = file.getInterfaces();

    cerbosModule.addStatements(createdInterfaces.map((i) => i.getText()));
    file.delete();
  })
);

const paramsUnionEntry = await Promise.all(
  yamlFiles.map(async (filePath) => {
    const fileName = generateName(path.parse(filePath).name, new Set());

    const parsed = yamlSchema.parse(
      yaml.load(fs.readFileSync(filePath, "utf8"))
    );

    // TODO
    if (parsed.resourcePolicy.schemas == null) return;

    const locallyAllowedParamsType = cerbosModule.addTypeAlias({
      name: "isAllowedParams" + fileName,
      type: `{
      principal: Principal ${
        parsed.resourcePolicy.schemas.principalSchema != null
          ? ` & {
        attributes?: ${generateName(
          path.parse(parsed.resourcePolicy.schemas.principalSchema?.ref).name,
          new Set()
        )}
      }`
          : ""
      }
      resource: { kind: "${parsed.resourcePolicy.resource}" }
      action: ${uniqueArray(
        parsed.resourcePolicy.rules.flatMap((rule) =>
          rule.actions.map((action) => `"${action}"`)
        )
      ).join(" | ")}
    }`,
    });
    return locallyAllowedParamsType;
  })
);

const allowedParamsType = cerbosModule.addTypeAlias({
  name: "isAllowedParams",
  type: `IsAllowedRequest & (
     ${paramsUnionEntry
       .filter(notEmpty)
       .map((p) => p.getName())
       .join(" | ")})`,
});

httpInterface.addMethod({
  name: "isAllowed",
  parameters: [{ name: "request", type: allowedParamsType.getName() }],
  returnType: "Promise<boolean>",
});

// Save the source file
await outSourceFile.save();

function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function findFiles(dir: string, extensions: string[], fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fileList = findFiles(filePath, extensions, fileList);
    } else if (extensions.includes(path.extname(filePath))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/** removes empty elements from an array, so that TypeScript knows */
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value != null;
}
