import { join } from "node:path";
import { errorMessage } from "./errors/error-message";
import { KlauzStorageError } from "./errors/klauz-error";
import {
    collectionDataArraySchema,
    collectionDataSchema,
    deleteOptionsSchema,
    findAllOptionsSchema,
    findOptionsSchema,
    parseSchema,
    updateOptionsSchema
} from "./schemas/collection-schemas";
import { JsonStorage } from "./storage/json-storage";
import {
    CollectionContent,
    CollectionData,
    CollectionDataWithZID,
    CollectionProps,
    DeleteOptions,
    FindOptions,
    FindOptionsWithoutWhere,
    KzObject,
    LegacyCollectionContent,
    Output,
    UpdateOptions,
    ZID
} from "./types";

export class Collection {
    readonly #name: string
    readonly #path: string
    readonly #storage: JsonStorage
    #content = {} as CollectionContent

    constructor(private readonly props: CollectionProps) {
        const fileExtension = '.json'
        const { path, name } = props
        this.#name = name
        this.#path = join(path, `.${name}${fileExtension}`)
        this.#storage = new JsonStorage(this.#path)
    }

    async init(): Promise<this> {
        await this.#load()
        return this
    }

    async #load(): Promise<void> {
        if (!await this.#storage.exists()) {
            const content: CollectionContent = {
                collection_name: this.#name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                data: []
            }
            this.#content = content
            await this.#save(this.#content)
            return
        }

        try {
            const content = await this.#storage.read<LegacyCollectionContent>()
            this.#content = this.#normalizeContent(content)
        } catch (err) {
            throw new KlauzStorageError('Invalid collection JSON file', { cause: err })
        }
    }

    #normalizeContent(content: LegacyCollectionContent): CollectionContent {
        const updatedAt = content.updated_at ?? content.last_interaction ?? content.created_at

        return {
            collection_name: content.collection_name,
            created_at: content.created_at,
            updated_at: updatedAt,
            data: content.data
        }
    }

    async #save(content: CollectionContent): Promise<void> {
        await this.#storage.write(content)
    }

    async #setCollectionDataValue(data: CollectionDataWithZID): Promise<void> {
        this.#content.updated_at = new Date().toISOString()
        this.#content.data.push(data)
        await this.#save(this.#content)
    }

    async #setCollectionData(data: CollectionDataWithZID[]): Promise<void> {
        this.#content.updated_at = new Date().toISOString()
        this.#content.data = data
        await this.#save(this.#content)
    }

    async #getCollectionData(): Promise<CollectionDataWithZID[]> {
        await this.#load()
        return this.#content.data
    }

    #getLastNumericId(data = this.#content.data): ZID {
        const lastObject = data.findLast((obj: CollectionDataWithZID) => typeof obj._zid === 'number')
        return lastObject?._zid ?? 0
    }

    #removeInternalFields(data: CollectionData): CollectionData {
        const safeData = { ...data }
        Reflect.deleteProperty(safeData, '_zid')
        return safeData
    }

    #cloneData(data: CollectionDataWithZID[]): CollectionDataWithZID[] {
        return data.map((obj) => ({ ...obj }))
    }

    #hideInfo(data: CollectionDataWithZID[], hideInfo?: string[]): CollectionDataWithZID[] {
        const output = this.#cloneData(data)

        if (!hideInfo || hideInfo.length === 0) return output

        for (const obj of output) {
            for (const info of hideInfo) {
                Reflect.deleteProperty(obj, info)
            }
        }

        return output
    }

    get information(): Promise<Omit<CollectionContent, 'data'>> {
        return this.#getInformation()
    }

    async #getInformation(): Promise<Omit<CollectionContent, 'data'>> {
        await this.#load()
        return {
            collection_name: this.#content.collection_name,
            created_at: this.#content.created_at,
            updated_at: this.#content.updated_at,
        }
    }

    async add(data: CollectionData): Promise<Output<CollectionDataWithZID>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            await this.#load()
            const obj = this.#removeInternalFields(parseSchema(collectionDataSchema, data)) as CollectionDataWithZID
            const lastId = this.#getLastNumericId()
            Reflect.set(obj, '_zid', lastId + 1)
            await this.#setCollectionDataValue(obj)
            return { ...obj }
        } catch (err) {
            return errorMessage(err)
        }
    }

    async addMany(data: CollectionData[]): Promise<Output<CollectionDataWithZID[]>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            await this.#load()
            const objs = parseSchema(collectionDataArraySchema, data).map((obj) => this.#removeInternalFields(obj)) as CollectionDataWithZID[]
            let lastId = this.#getLastNumericId()

            for (const obj of objs) {
                Reflect.set(obj, '_zid', ++lastId)
            }

            await this.#setCollectionData([
                ...this.#content.data,
                ...objs
            ])

            return this.#cloneData(objs)
        } catch (err) {
            return errorMessage(err)
        }
    }

    async findAll(options?: FindOptionsWithoutWhere): Promise<Output<CollectionDataWithZID[]>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            const collectionData = await this.#getCollectionData()
            const zOpts = parseSchema(findAllOptionsSchema, options) as FindOptionsWithoutWhere
            return this.#hideInfo(collectionData, zOpts?.hideInfo)
        } catch (err) {
            return errorMessage(err)
        }
    }

    async find<T>(options: FindOptions<KzObject<T>>): Promise<Output<CollectionDataWithZID[]>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            const { where, ...opts } = parseSchema(findOptionsSchema, options) as FindOptions<T>
            const collectionData = await this.#getCollectionData() as any
            const output = collectionData.filter((obj: KzObject<T>) => where.call(undefined, obj)) as CollectionDataWithZID[]
            return this.#hideInfo(output, opts.hideInfo)
        } catch (err) {
            return errorMessage(err)
        }
    }

    async update<T>(options: UpdateOptions<KzObject<T>>): Promise<Output<CollectionDataWithZID[]>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            const { where, values } = parseSchema(updateOptionsSchema, options) as UpdateOptions<T>
            const safeValues = this.#removeInternalFields(values ?? {})
            const collectionData = await this.#getCollectionData() as any
            const output = [] as CollectionDataWithZID[]
            for (const obj of collectionData) {
                if (where.call(undefined, obj)) {
                    Object.assign(obj, {
                        ...obj,
                        ...safeValues,
                        _zid: obj._zid
                    })
                    output.push({ ...obj })
                }
            }
            if (output.length === 0) throw Error('Data not found')
            await this.#setCollectionData(collectionData)
            return output
        } catch (err) {
            return errorMessage(err)
        }
    }

    async delete<T>(options: DeleteOptions<KzObject<T>>): Promise<Output<void>> {
        try {
            if (arguments.length > 1) throw Error('Invalid params')
            const { where } = parseSchema(deleteOptionsSchema, options) as DeleteOptions<T>
            const collectionData = await this.#getCollectionData() as any
            const dataPostDelete = collectionData.filter((obj: KzObject<T>) => !where(obj)) as CollectionDataWithZID[]
            if (collectionData.length === dataPostDelete.length) return
            await this.#setCollectionData(dataPostDelete)
        } catch (err) {
            return errorMessage(err)
        }
    }

    async reset(): Promise<Output<void>> {
        try {
            await this.#load()
            await this.#setCollectionData([])
        } catch (err) {
            return errorMessage(err)
        }
    }

    async drop(): Promise<void> {
        await this.#storage.delete()
    }
}
