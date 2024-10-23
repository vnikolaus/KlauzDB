import { accessSync, constants, readFileSync, unlinkSync, writeFileSync } from "fs";
import z from 'zod';
import { errorMessage } from "./Error";
import {
    CollectionContent,
    CollectionData,
    CollectionDataWithZID,
    CollectionProps,
    DeleteOptions,
    FindOptions,
    FindOptionsWithoutWhere,
    KzObject,
    Output,
    UpdateOptions,
    ZID
} from "./Types";

export class Collection {
    readonly #name: string
    readonly #path: string
    #content = {} as CollectionContent

    constructor(private readonly props: CollectionProps) {
        const fileExtension = '.json'
        const { path, name } = props
        this.#name = name
        this.#path = `${path}/.${name}${fileExtension}`
        this.#load()
    }

    #load(): void {
        try {
            accessSync(this.#path, constants.F_OK)
            const readedContent = readFileSync(this.#path, {
                encoding: 'utf-8'
            })
            this.#content = JSON.parse(readedContent)
        } catch (err) {
            const content: CollectionContent = {
                collection_name: this.#name,
                created_at: new Date().toISOString(),
                last_interaction: new Date().toISOString(),
                data: []
            }
            this.#content = content
        } finally {
            this.#save(this.#content)
        }
    }

    #save(content: CollectionContent): void {
        writeFileSync(this.#path, JSON.stringify(content, null, 2))
    }

    #setCollectionDataValue(data: CollectionDataWithZID): void {
        this.#load()
        this.#content.last_interaction = new Date().toISOString()
        this.#content.data.push(data)
        this.#save(this.#content)
    }

    #setCollectionData(data: CollectionDataWithZID[]): void {
        this.#load()
        this.#content.last_interaction = new Date().toISOString()
        this.#content.data = data
        this.#save(this.#content)
    }

    #getCollectionData(): CollectionDataWithZID[] {
        this.#load()
        return this.#content.data
    }

    #getLastNumericId(): ZID {
        this.#load()
        const lastObject = this.#content.data.findLast((obj: CollectionDataWithZID) => typeof obj._zid === 'number')
        return lastObject?._zid ?? 0
    }

    get information(): Omit<CollectionContent, 'data'> {
        this.#load()
        return {
            collection_name: this.#content.collection_name,
            created_at: this.#content.created_at,
            last_interaction: this.#content.last_interaction,
        }
    }

    add(data: CollectionData): Output<CollectionDataWithZID> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const schema = z.record(z.string(), z.any(), { message: `Content must be a object. Use 'addMany' method, to insert a new array` })
            const obj = schema.parse(data) as CollectionDataWithZID
            const lastId = this.#getLastNumericId()
            Reflect.set(obj, '_zid', lastId + 1)
            this.#setCollectionDataValue(obj)
            return obj
        } catch (err) {
            return errorMessage(err)
        }
    }

    addMany(data: CollectionData[]): Output<CollectionDataWithZID[]> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const schemaArray = z.array(z.record(z.string(), z.any()))
            const schemaObject = z.record(z.string(), z.any())
            const objs = schemaArray.parse(data) as CollectionDataWithZID[]
            for (const obj of objs) {
                schemaObject.parse(obj)
                const lastId = this.#getLastNumericId()
                Reflect.set(obj, '_zid', lastId + 1)
                this.#setCollectionDataValue(obj)
            }
            return objs
        } catch (err) {
            return errorMessage(err)
        }
    }

    findAll(options?: FindOptionsWithoutWhere): Output<CollectionDataWithZID[]> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const collectionData = this.#getCollectionData()
            const optionsSchema = z.object({
                hideInfo: z.array(z.string()).optional(),
            }).optional()
            const zOpts = optionsSchema.parse(options) as FindOptionsWithoutWhere
            if (zOpts && Object.values(zOpts).length > 0) {
                const keys = Object.keys(zOpts) as Array<keyof FindOptionsWithoutWhere>
                for (const key of keys) {
                    if (!zOpts[key]) continue
                    switch (key) {
                        case 'hideInfo':
                            const infos = zOpts.hideInfo as NonNullable<FindOptionsWithoutWhere['hideInfo']>
                            infos.forEach((info: string) => {
                                for (const obj of collectionData) {
                                    if (!Reflect.has(obj, info)) continue
                                    Reflect.deleteProperty(obj, info)
                                }
                            })
                        break;
                    }
                }
            }
            return collectionData
        } catch (err) {
            return errorMessage(err)
        }
    }

    find<T>(options: FindOptions<KzObject<T>>): Output<CollectionDataWithZID[]> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const optionsSchema = z.object({
                where: z.function(),
                hideInfo: z.array(z.string()).optional(),
            })
            const { where, ...opts } = optionsSchema.parse(options) as FindOptions<T>
            const collectionData = this.#getCollectionData() as any
            const output = [] as CollectionDataWithZID[]
            for (const obj of collectionData) {
                if (where.call(undefined, obj)) {
                    if (opts && Object.values(opts).length > 0) {
                        const keys = Object.keys(opts) as Array<keyof FindOptions<T>>
                        for (const key of keys) {
                            switch (key) {
                                case 'hideInfo':
                                    const infos = opts.hideInfo as NonNullable<FindOptions<T>['hideInfo']>
                                    infos.forEach((info: string) => Reflect.deleteProperty(obj, info))
                                break;
                            }
                        }
                    }
                    output.push(obj)
                } 
            }
            return output
        } catch (err) {
            return errorMessage(err)
        }
    }

    update<T>(options: UpdateOptions<KzObject<T>>): Output<CollectionDataWithZID[]> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const optionsSchema = z.object({
                where: z.function(),
                values: z.record(z.string(), z.any()),
            })
            const { where, values } = optionsSchema.parse(options) as UpdateOptions<T>
            const collectionData = this.#getCollectionData() as any
            const output = [] as CollectionDataWithZID[]
            for (const obj of collectionData) {
                if (where.call(undefined, obj)) {
                    const tempId = obj._zid as ZID
                    Reflect.deleteProperty(obj, '_zid')
                    Object.assign(obj, {
                        ...obj,
                        ...values,
                        _zid: tempId
                    })
                    output.push(obj)
                }
            }
            if (output.length === 0) throw Error('Data not found')
            this.#setCollectionData(collectionData)
            return output
        } catch (err) {
            return errorMessage(err)
        }
    }

    delete<T>(options: DeleteOptions<KzObject<T>>): Output<void> {
        try {
            if (arguments.length > 1) throw TypeError('Invalid params')
            const optionsSchema = z.object({
                where: z.function(),
            })
            const { where } = optionsSchema.parse(options) as DeleteOptions<T>
            const collectionData = this.#getCollectionData() as any
            const dataPostDelete = collectionData.filter((obj: KzObject<T>) => !where(obj)) as CollectionDataWithZID[]
            if (collectionData.length === dataPostDelete.length) return
            this.#setCollectionData(dataPostDelete)
        } catch (err) {
            return errorMessage(err)
        }
    }

    reset(): Output<void> {
        try {
            this.#load()
            const arr = [] as CollectionDataWithZID[]
            this.#setCollectionData(arr)
        } catch (err) {
            return errorMessage(err)
        }
    }

    drop(): void {
        unlinkSync(this.#path)
    }
}