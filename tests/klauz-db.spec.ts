import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { KlauzDB } from '../src/klauz-db'
import { CollectionDataWithZID, Output } from '../src/types'

type User = {
    id: number
    name: string
    admin: boolean
}

let dbPath = ''

function expectData<T>(output: Output<T>): T {
    expect(output).not.toHaveProperty('error')
    return output as T
}

function expectError<T>(output: Output<T>) {
    expect(output).toHaveProperty('error')
    return output as Extract<Output<T>, { error: string }>
}

function users(quantity: number): User[] {
    return Array.from({ length: quantity }, (_, index) => ({
        id: index + 1,
        name: `User_${index + 1}`,
        admin: index === 0
    }))
}

async function readCollectionFile(collectionName: string) {
    const content = await readFile(join(dbPath, `.${collectionName}.json`), 'utf-8')
    return JSON.parse(content) as {
        collection_name: string
        created_at: string
        updated_at?: string
        last_interaction?: string
        data: CollectionDataWithZID[]
    }
}

beforeEach(async () => {
    dbPath = join(tmpdir(), `klauz-db-${crypto.randomUUID()}`)
    await mkdir(dbPath, { recursive: true })
})

afterEach(async () => {
    await rm(dbPath, {
        recursive: true,
        force: true
    })
})

describe('KlauzDB', () => {
    test('creates a collection with async API', async () => {
        const db = new KlauzDB({ path: dbPath })
        const collection = await db.createCollection('users')

        await expect(access(join(dbPath, '.users.json'))).resolves.toBeUndefined()
        await expect(collection.information).resolves.toMatchObject({
            collection_name: 'users',
            updated_at: expect.any(String)
        })
    })

    test('validates path and collection name', async () => {
        expect(() => new KlauzDB({ path: '' })).toThrow()

        const db = new KlauzDB({ path: dbPath })
        await expect(db.createCollection('../users')).rejects.toThrow()
    })
})

describe('Collection add and addMany', () => {
    test('adds data and owns _zid', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        const output = expectData(await collection.add({
            id: 1,
            name: 'User_1',
            admin: true,
            _zid: 999
        }))

        expect(output).toMatchObject({
            id: 1,
            _zid: 1
        })
    })

    test('adds many records with sequential ids in batch', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        const output = expectData(await collection.addMany([
            { id: 1, name: 'User_1', admin: true, _zid: 999 },
            { id: 2, name: 'User_2', admin: false, _zid: 999 }
        ]))

        expect(output.map((obj) => obj._zid)).toEqual([1, 2])

        const persisted = await readCollectionFile('users')
        expect(persisted.data.map((obj) => obj._zid)).toEqual([1, 2])
    })
})

describe('Collection read operations', () => {
    test('findAll applies hideInfo without mutating persisted data', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(2))

        const hidden = expectData(await collection.findAll({ hideInfo: ['admin', '_zid'] }))
        expect(hidden[0]).not.toHaveProperty('admin')
        expect(hidden[0]).not.toHaveProperty('_zid')

        const persisted = expectData(await collection.findAll())
        expect(persisted[0]).toHaveProperty('admin')
        expect(persisted[0]).toHaveProperty('_zid')
    })

    test('find filters data and applies hideInfo without mutation', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(3))

        const output = expectData(await collection.find<User>({
            where: (obj) => obj.admin,
            hideInfo: ['admin']
        }))

        expect(output).toHaveLength(1)
        expect(output[0]).not.toHaveProperty('admin')

        const persisted = expectData(await collection.findAll())
        expect(persisted[0]).toHaveProperty('admin')
    })
})

describe('Collection write operations', () => {
    test('updates records and preserves _zid', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(2))

        const output = expectData(await collection.update<User>({
            where: (obj) => obj.id === 1,
            values: {
                name: 'Updated',
                _zid: 999
            }
        }))

        expect(output[0]).toMatchObject({
            name: 'Updated',
            _zid: 1
        })
    })

    test('returns an error when update matches nothing', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(2))

        const output = expectError(await collection.update<User>({
            where: (obj) => obj.id === 999,
            values: { name: 'Missing' }
        }))

        expect(output.error).toBe('Data not found')
    })

    test('deletes records and leaves data untouched when no record matches', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(3))

        await collection.delete<User>({
            where: (obj) => obj.id === 1
        })

        const afterDelete = expectData(await collection.findAll())
        expect(afterDelete.map((obj) => obj.id)).toEqual([2, 3])

        await collection.delete<User>({
            where: (obj) => obj.id === 999
        })

        const afterNoop = expectData(await collection.findAll())
        expect(afterNoop.map((obj) => obj.id)).toEqual([2, 3])
    })

    test('resets and drops collection', async () => {
        const collection = await new KlauzDB({ path: dbPath }).createCollection('users')
        await collection.addMany(users(2))

        await collection.reset()
        expect(expectData(await collection.findAll())).toEqual([])

        await collection.drop()
        await expect(access(join(dbPath, '.users.json'))).rejects.toThrow()
    })
})

describe('Storage compatibility', () => {
    test('creates directory automatically', async () => {
        const nestedPath = join(dbPath, 'nested', 'db')
        const collection = await new KlauzDB({ path: nestedPath }).createCollection('users')

        await collection.add({ id: 1, name: 'User_1', admin: true })

        await expect(access(join(nestedPath, '.users.json'))).resolves.toBeUndefined()
    })

    test('reads legacy collection file', async () => {
        await writeFile(join(dbPath, '.legacy.json'), JSON.stringify({
            collection_name: 'legacy',
            created_at: new Date().toISOString(),
            last_interaction: new Date().toISOString(),
            data: [{ id: 1, name: 'Legacy', admin: true, _zid: 1 }]
        }))

        const collection = await new KlauzDB({ path: dbPath }).createCollection('legacy')
        const output = expectData(await collection.findAll())

        expect(output).toHaveLength(1)
        expect(output[0].name).toBe('Legacy')

        await collection.add({ id: 2, name: 'Migrated', admin: false })

        const migrated = await readCollectionFile('legacy')
        expect(migrated).toHaveProperty('updated_at')
        expect(migrated).not.toHaveProperty('last_interaction')
    })

    test('throws storage error for invalid JSON', async () => {
        await writeFile(join(dbPath, '.broken.json'), '{ invalid json')

        await expect(new KlauzDB({ path: dbPath }).createCollection('broken')).rejects.toMatchObject({
            name: 'KlauzStorageError'
        })
    })
})
