import fs from "fs"
import path from "path"

/** removes empty elements from an array, so that TypeScript knows */
export function notEmpty<TValue>(
	value: TValue | null | undefined,
): value is TValue {
	return value != null
}

export function uniqueArray<T>(arr: T[]): T[] {
	return [...new Set(arr)]
}

export function findFiles(
	dir: string,
	extensions: string[],
	fileList: string[] = [],
) {
	const files = fs.readdirSync(dir)

	files.forEach((file) => {
		const filePath = path.join(dir, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory()) {
			fileList = findFiles(filePath, extensions, fileList)
		} else if (extensions.includes(path.extname(filePath))) {
			fileList.push(filePath)
		}
	})

	return fileList
}

export function resolvePath(inputPath: string) {
	if (path.isAbsolute(inputPath)) {
		return inputPath
	} else {
		return path.resolve(process.cwd(), inputPath)
	}
}

export function Try<T>(fn: () => T, err: (e: Error) => any): T {
	try {
		return fn()
	} catch (e) {
		return err(e as Error)
	}
}
