# KlauzDB [![NPM version](https://img.shields.io/npm/v/klauz-db.svg?style=flat-square)](https://www.npmjs.com/package/klauz-db)

KlauzDB é um banco de dados local orientado a collections, simples e leve, com persistência em arquivos JSON.

Ele foi pensado para protótipos, automações, testes, CLIs, aplicações locais e projetos pequenos que precisam persistir dados estruturados sem configurar um banco externo.

## Instalação

```bash
npm install klauz-db
```

## Usabilidade

ESM:

```ts
import { KlauzDB } from 'klauz-db'

const db = new KlauzDB({
    path: './db'
})

const users = await db.createCollection('users')
```

CommonJS:

```js
const { KlauzDB } = require('klauz-db')

async function main() {
    const db = new KlauzDB({
        path: './db'
    })

    const users = await db.createCollection('users')
}

main()
```

O arquivo da collection é criado automaticamente no diretório informado:

```txt
db/.users.json
```

## Documentação

KlauzDB expõe a classe `KlauzDB`.

### createCollection

Cria ou carrega uma collection.

```ts
const collection = await db.createCollection('users')
```

Parâmetros:

```ts
collectionName: string
```

Retorno:

```ts
Promise<Collection>
```

Exemplo:

```ts
const users = await db.createCollection('users')
const info = await users.information

console.log(info)
```

Saída:

```json
{
    "collection_name": "users",
    "created_at": "2026-05-21T20:00:00.000Z",
    "updated_at": "2026-05-21T20:00:00.000Z"
}
```

## Collection API

Todas as operações que acessam disco são assíncronas.

```ts
await collection.add(...)
await collection.addMany(...)
await collection.findAll(...)
await collection.find(...)
await collection.update(...)
await collection.delete(...)
await collection.reset()
await collection.drop()
```

### add

Adiciona um registro na collection.

```ts
const user = await users.add({
    name: 'Victor',
    admin: true
})
```

Retorno:

```json
{
    "name": "Victor",
    "admin": true,
    "_zid": 1
}
```

O campo `_zid` é controlado pelo KlauzDB. Se enviado pelo usuário, será ignorado.

### addMany

Adiciona múltiplos registros em lote.

```ts
const output = await users.addMany([
    {
        name: 'Victor',
        admin: true
    },
    {
        name: 'Giovanna',
        admin: false
    }
])
```

Retorno:

```json
[
    {
        "name": "Victor",
        "admin": true,
        "_zid": 1
    },
    {
        "name": "Giovanna",
        "admin": false,
        "_zid": 2
    }
]
```

### findAll

Retorna todos os registros da collection.

```ts
const allUsers = await users.findAll()
```

Com `hideInfo`:

```ts
const publicUsers = await users.findAll({
    hideInfo: ['admin', '_zid']
})
```

`hideInfo` remove campos apenas do retorno. Os dados persistidos não são alterados.

### find

Retorna registros filtrados por callback.

```ts
type User = {
    name: string
    admin: boolean
}

const admins = await users.find<User>({
    where: (user) => user.admin
})
```

Com `hideInfo`:

```ts
const publicAdmins = await users.find<User>({
    where: (user) => user.admin,
    hideInfo: ['admin']
})
```

O callback recebe o objeto com `_zid` tipado.

```ts
const user = await users.find<User>({
    where: (user) => user._zid === 1
})
```

### update

Atualiza todos os registros que passarem no callback `where`.

```ts
const updated = await users.update<User>({
    where: (user) => user.name === 'Victor',
    values: {
        admin: false
    }
})
```

Retorno:

```json
[
    {
        "name": "Victor",
        "admin": false,
        "_zid": 1
    }
]
```

O campo `_zid` não pode ser alterado por `update`.

### delete

Remove todos os registros que passarem no callback `where`.

```ts
await users.delete<User>({
    where: (user) => user.admin === false
})
```

Não possui retorno em caso de sucesso.

### reset

Remove todos os registros da collection, mantendo o arquivo da collection.

```ts
await users.reset()
```

### drop

Remove o arquivo da collection.

```ts
await users.drop()
```

## Erros

Métodos de CRUD retornam:

```ts
T | {
    error: string
    code: string
}
```

Exemplo:

```ts
const output = await users.update<User>({
    where: (user) => user.name === 'missing',
    values: {
        admin: true
    }
})

if ('error' in output) {
    console.log(output.code, output.error)
}
```

Erros exportados:

```ts
import {
    KlauzError,
    KlauzValidationError,
    KlauzStorageError,
    KlauzNotFoundError
} from 'klauz-db'
```

## Formato do arquivo

Cada collection é salva como um JSON oculto:

```json
{
    "collection_name": "users",
    "created_at": "2026-05-21T20:00:00.000Z",
    "updated_at": "2026-05-21T20:00:00.000Z",
    "data": [
        {
            "name": "Victor",
            "admin": true,
            "_zid": 1
        }
    ]
}
```

## Migração de 0.5.x para 1.0.0

Principais mudanças:

- API de I/O agora é async.
- `createCollection` agora deve ser usado com `await`.
- `collection.information` agora retorna `Promise`.
- `last_interaction` foi substituído por `updated_at`.
- Arquivos antigos com `last_interaction` continuam sendo lidos.
- `hideInfo` não altera mais os dados persistidos.
- `_zid` é protegido contra insert/update manual.
- `addMany` salva os dados em lote.

Antes:

```ts
const users = db.createCollection('users')
const allUsers = users.findAll()
```

Agora:

```ts
const users = await db.createCollection('users')
const allUsers = await users.findAll()
```

## Desenvolvimento

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Autor

Victor Nikolaus - [GitHub](https://github.com/vnikolaus)
