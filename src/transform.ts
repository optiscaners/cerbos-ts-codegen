import chalk from "chalk"
import fs, { readFileSync } from "fs"
import yaml from "js-yaml"
import { JSONSchema4 } from "json-schema"
import { compile } from "json-schema-to-typescript"
import {
	justName,
	toSafeString,
} from "json-schema-to-typescript/dist/src/utils.js"
import path, { dirname } from "path"
import { format } from "prettier"
import { Project } from "ts-morph"
import { z } from "zod"
import { Try, findFiles, notEmpty, resolvePath, uniqueArray } from "./util.js"

function generateName(from: string) {
	return toSafeString(justName(from) + "Attributes")
}

export default async function transform(
	resourceFolderPath: string,
	destination: string,
) {
	const project = new Project({})

	const yamlFiles = await findFiles(resolvePath(resourceFolderPath), [
		".yaml",
		".yml",
	])

	const schemaFiles = await findFiles(
		path.join(resolvePath(resourceFolderPath), "/_schemas"),
		[".json"],
	)

	// Zod Schema to validate Resource Policy YAML Files
	const yamlSchema = z.object({
		resourcePolicy: z.object({
			resource: z.string(),
			rules: z.array(z.object({ actions: z.array(z.string()) })),
			schemas: z.optional(
				z.object({
					principalSchema: z.optional(z.object({ ref: z.string() })),
					resourceSchema: z.optional(z.object({ ref: z.string() })),
				}),
			),
		}),
	})

	const sourceFile = project.createSourceFile(resolvePath(destination), "", {
		overwrite: true,
	})

	sourceFile.addImportDeclaration({
		moduleSpecifier: "@cerbos/core/lib/types/external",
		isTypeOnly: true,
		namedImports: ["Principal", "IsAllowedRequest"],
	})

	const cerbosModule = sourceFile.addModule({ name: '"@cerbos/http"' })

	const httpInterface = cerbosModule.addInterface({
		name: "HTTP",
	})

	// parse all schemas and add them to the source file as interfaces
	await Promise.all(
		schemaFiles.map(async (filePath) => {
			const schema = await compileFromFile(filePath)
			const temporaryFile = project.createSourceFile("", schema)
			const createdInterfaces = temporaryFile.getInterfaces()

			cerbosModule.addStatements(createdInterfaces.map((i) => i.getText()))
			temporaryFile.delete()
		}),
	)

	// create a type alias for each resource policy.
	// return the result to later use it as isAllowedParams union
	const paramsUnionEntry = await Promise.all(
		yamlFiles.map(async (filePath) => {
			try {
				const fileName = generateName(filePath)

				const parsed = yamlSchema.parse(
					yaml.load(fs.readFileSync(filePath, "utf8")),
				)

				const locallyAllowedParamsType = cerbosModule.addTypeAlias({
					name: "isAllowedParams" + fileName,
					type: `{
      principal: Principal${
				parsed.resourcePolicy.schemas?.principalSchema != null
					? ` & {
        attributes?: ${generateName(
					parsed.resourcePolicy.schemas.principalSchema?.ref,
				)}
      }`
					: ""
			}
      resource: { kind: "${parsed.resourcePolicy.resource}"${
				parsed.resourcePolicy.schemas?.resourceSchema != null
					? `, attributes: ${generateName(
							parsed.resourcePolicy.schemas.resourceSchema.ref,
					  )}`
					: ""
			} }
      action: ${uniqueArray(
				parsed.resourcePolicy.rules.flatMap((rule) =>
					rule.actions.map((action) => `"${action}"`),
				),
			).join(" | ")}
    }`,
				})
				return locallyAllowedParamsType
			} catch (e) {
				return undefined
			}
		}),
	)

	const allowedParamsType = cerbosModule.addTypeAlias({
		name: "isAllowedParams",
		type: `IsAllowedRequest &    (
     ${paramsUnionEntry
				.filter(notEmpty)
				.map((p) => p.getName())
				.join(" | ")})`,
	})

	httpInterface.addMethod({
		name: "isAllowed",
		parameters: [{ name: "request", type: allowedParamsType.getName() }],
		returnType: "Promise<boolean>",
	})

	console.log(
		"\nCreated File: \n" + chalk.bold(sourceFile.getFilePath()) + "\n",
	)

	sourceFile.replaceWithText(
		await format(sourceFile.getText(), {
			parser: "typescript",
			useTabs: true,
			semi: false,
		}),
	)

	// Save the source file
	await sourceFile.save()
	return sourceFile
}

/**
 * overrides the default compile function from json-schema-to-typescript
 * updates the name of the generated interface to match the file name PLUS "Attributes"
 */
export function compileFromFile(filename: string): Promise<string> {
	const contents = Try(
		() => readFileSync(filename),
		() => {
			throw new ReferenceError(`Unable to read file "${filename}"`)
		},
	)
	const schema = Try<JSONSchema4>(
		() => JSON.parse(contents.toString()),
		() => {
			throw new TypeError(`Error parsing JSON in file "${filename}"`)
		},
	)
	return compile(schema, generateName(filename), {
		cwd: dirname(filename),
	})
}
