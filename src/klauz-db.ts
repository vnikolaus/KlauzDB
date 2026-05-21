import { Collection } from "./collection";
import { collectionNameSchema, klauzPropsSchema, parseSchema } from "./schemas/collection-schemas";
import { KlauzProps } from "./types";

export class KlauzDB {
    public path: string = ''
    
    constructor(props: KlauzProps) {
        const { path } = parseSchema(klauzPropsSchema, props)
        this.path = path
    }

    async createCollection(collectionName: string): Promise<Collection> {
        const name = parseSchema(collectionNameSchema, collectionName)
        const collection = new Collection({
            name,
            path: this.path
        })
        return collection.init()
    }
}
