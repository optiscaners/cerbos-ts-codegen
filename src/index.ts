#!/usr/bin/env node
import { input, select } from "@inquirer/prompts"
import transform from "./transform.js"

await select<"local" | "admin-api">({
	message: "Where are your schemas and resource policies located?",
	choices: [
		{
			name: "locally",
			value: "local",
			description: "The files are located on my local machine",
		},
		{
			name: "cerbos admin API",
			value: "admin-api",
			description: "fetches the files from the Cerbos admin API",
			disabled: "(not implemented yet)",
		},
	],
})

const resourceFolderPath = await input({
	message: "Enter the path",
	default: "./example",
})

const destination = await input({
	message: "Where should the generated files be saved?",
	default: "./types/cerbos.d.ts",
})

await transform(resourceFolderPath, destination)
