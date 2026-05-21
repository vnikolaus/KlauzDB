import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export class JsonStorage {
    constructor(private readonly filePath: string) {}

    async exists(): Promise<boolean> {
        try {
            await access(this.filePath)
            return true
        } catch {
            return false
        }
    }

    async read<T>(): Promise<T> {
        const content = await readFile(this.filePath, {
            encoding: 'utf-8'
        })

        return JSON.parse(content) as T
    }

    async write<T>(data: T): Promise<void> {
        await mkdir(dirname(this.filePath), {
            recursive: true
        })

        await writeFile(this.filePath, JSON.stringify(data, null, 2))
    }

    async delete(): Promise<void> {
        await unlink(this.filePath)
    }
}
