# @estino/cerbos-ts-codegen

Create typescript types based on cerbos schemas.

Currently [cerbos](https://cerbos.dev/) does not provide a way to generate typescript types based on the schemas, see [https://github.com/cerbos/cerbos-sdk-javascript/issues/540](https://github.com/cerbos/cerbos-sdk-javascript/issues/540). This project aims to fill that gap for our needs for now.

## Usage

```bash
npx @estino/cerbos-ts-codegen
```

## Approach taken

- parses the provided cerbos resource policies provided in yaml files
- parses the provided schema files
- creates a TypeScript Declaration File (`.d.ts`) merging the builtin declarations to enforce stricter parameter types for the `isAllowed` method of `@cerbos/http`

## Known limitations

- **many!** Among others:
- multiple schemas with the same file name in different folders are not supported
- fetching schemas and policies from the Admin API is not yet supported, though the CLI already hints at it
- only the `isAllowed` method of `@cerbos/http` is supported right now
- `derived roles` are not supported as we don't use them currently

## Example

### Input Resource Policy & Schemas

```yaml
# policies/contract.yaml
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: default
  resource: contract

  rules:
    - actions:
        - "view"
      effect: EFFECT_ALLOW
      roles: [user]
      condition:
        match:
          expr: P.attr.department == "legal"
    - actions:
        - "edit"
      effect: EFFECT_ALLOW
      roles: [user]
      condition:
        match:
          all:
            of:
              - expr: P.attr.organisation == R.attr.organisation
              - expr: P.attr.department == "legal"

  schemas:
    principalSchema:
      ref: cerbos://schemas/principal.json
    resourceSchema:
      ref: cerbos://schemas/contract.json
```

```yaml
# schemas/principal.json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties":
    {
      "department": { "enum": ["tech", "legal"] },
      "organisation": { "type": "string" },
    },
  "required": ["department", "organisation"],
}
```

```yaml
# schemas/contract.json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": { "organisation": { "type": "string" } },
  "required": ["organisation"],
}
```

### Codegen Result
