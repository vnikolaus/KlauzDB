import z from 'zod';
import { Collection } from "./Collection";
import { KlauzProps } from "./Types";

export class KlauzDB {
    public path: string = ''
    
    constructor(props: KlauzProps) {
        const schema = z.object({
            path: z.string().min(1)
        })
        const { path } = schema.parse(props)
        this.path = path
    }

    createCollection(collectionName: string): Collection {
        const schema = z.string().min(1)
        const name = schema.parse(collectionName)
        const collection = new Collection({
            name,
            path: this.path
        })
        return collection
    }
}