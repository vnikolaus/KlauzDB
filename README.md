<!-- # KlauzDB [![NPM version](https://img.shields.io/npm/v/klauz-db.svg?style=flat-square)](https://www.npmjs.com/package/klauz-db) -->
# KlauzDB [![NPM version]]

KlauzDB é um banco de dados orientando a **Collections**, que tem como proposta ser extremamente simples de se usar e rápido nas operações CRUD, pois utiliza o armazenamento local da máquina para persistir os dados, e não necessita de nenhuma conexão externa para seu funcionamento.

Ideal para testes automatizados, vídeo-aulas ou aplicações com um grau menor de complexidade na persistência dos dados.
<br>

* [🌱 Instalação](#-Instalação)
* [🏗️ Usabilidade](#%EF%B8%8F-Usabilidade)
* [📖 Docs](#-Documentação)
<!-- * [📚 Examples](#-examples) -->
<!-- * [❓ FAQ](#-faq) -->
<!-- * [⏱️ Changelog](./CHANGELOG.md) -->

## 🌱 Instalação

```bash
# instalação local (recomendado)
npm install klauz-db --save
```

Instalação via yarn: `yarn add klauz-db`

## 🏗️ Usabilidade

No começo da sua aplicação, importe o pacote "klauz-db" e defina o path principal para suas collections:

```javascript
const { KlauzDB } = require('klauz-db')

const kz = new KlauzDB({
    path: '{db_path}'
})
```

ES6:

```javascript
import { KlauzDB } from 'klauz-db'

const kz = new KlauzDB({
    path: '{db_path}'
})
```

Feito isso, você já pode criar suas Collections.
<br>

## 📖 Documentação

KlauzDB expõe apenas uma função:

* `createCollection`

### createCollection()
Habilita uma nova instância Collection, e cria seu arquivo json para persistência de dados.

#### Syntax
```js
kz.createCollection(nomeCollection)
```

#### Parâmetros
`nomeCollection: string`<br><br>Nome utilizado para criação de uma nova Collection e seu arquivo de persistência de dados;

#### Retorno
Instância própria da Collection, habilitando acesso as funções de banco de dados;

#### Exemplo
```js
const kz = new KlauzDB({
    path: './'
})

const collection = kz.createCollection('coll-teste')

console.log(collection.information)
// Resultado:
    {
        "collection_name": "coll-teste",
        "created_at": "2024-08-25T22:41:57.416Z",
        "last_interaction": "2024-08-25:41:57.416Z",
    }
//
```

Com sua collection criada agora você já tem acesso as seguintes funções de db:
```js
.add()
.addMany()
.update()
.delete()
.findAll()
.find()
.reset()
```
<br>

### add
Adiciona um novo objeto dentro da collection.

#### Syntax
```js
collection.add(valor)
```

#### Parâmetros
`valor: { key: value }` *(obrigatório)*<br><br>Objeto chave-valor utilizado para inserir um único registro dentro da Collection;

#### Retorno
Objeto adicionado já com as novas propriedades criadas pelo banco de dados;

#### Exemplo
```js
const output = collection.add({
    nome: 'User_1',
    admin: true
})

console.log("output: ", output);
// Resultado:
    {
        "nome": "User_1",
        "admin": true
        "_zid": 1
    }
//
```
<br>

### addMany
Adiciona um novo array de objetos dentro da collection.

#### Syntax
```js
collection.addMany(valor)
```

#### Parâmetros
`valor: [{ key: value }, { key: value }]` *(obrigatório)*<br><br>Array utilizado para inserir diversos registros dentro da Collection;

#### Retorno
Array de objetos adicionados já com as novas propriedades criadas pelo banco de dados;

#### Exemplo
```js
const output = collection.addMany([
    {
        nome: 'User_1',
        admin: true
    },
    {
        nome: 'User_2',
        admin: false
    }
])

console.log("output: ", output);
// Resultado:
    [
        {
            "nome": "User_1",
            "admin": true,
            "_zid": 1
        },
        {
            "nome": "User_2",
            "admin": false,
            "_zid": 2
        }
    ]
//
```
<br>

### findAll
Retorna todos os dados contidos dentro da Collection.

#### Syntax
```js
const optionsFindAll = {
    hideInfo: Array<string>
}
collection.findAll(optionsFindAll?)
```

#### Parâmetros
`optionsFindAll.hideInfo:` *(opcional)*<br><br>Array contendo as informações que necessita esconder do retorno da função.<br>

#### Retorno
Todos os objetos persistidos na Collection;

#### Exemplo
```js
// Adicionando dados
collection.addMany([
    {
        nome: 'User_1',
        admin: false
    },
    {
        nome: 'User_2',
        admin: false
    }
])


// Consultando dados

// Sem hideInfo
const output1 = collection.findAll()
console.log("output1", output1);
// Resultado:
    [
        {
            "nome": "User_1",
            "admin": false,
            "_zid": 1
        },
                {
            "nome": "User_2",
            "admin": false,
            "_zid": 2
        }
    ]
//


// Com hideInfo
const output2 = collection.findAll({
    hideInfo: ['admin'] // Esconde as informações indicadas do retorno;
})
console.log("output2", output2);
// Resultado:
    [
        {
            "nome": "User_1",
            "_zid": 1
        },
        {
            "nome": "User_2",
            "_zid": 2
        }
    ]
//
```
<br>

### find
Retorna dados contidos na Collection, de acordo com a condição informada.

#### Syntax
```js
const optionsFind = {
    where: (obj) => {},
    hideInfo?: Array<string>
}
collection.find(optionsFind)
```

#### Parâmetros
`optionsFind.where:` *(obrigatório)*<br><br>Função callback que recebe como parâmetro os objetos contidos na Collection.<br>Seu retorno deve ser os objetos que serão consultados;<br><br>
`optionsFind.hideInfo:` *(opcional)*<br><br>Array contendo as informações que necessita esconder do retorno da função.<br><br>

#### Retorno
Objetos persistidos na Collection;

#### Exemplo
```js
// Adicionando dados
collection.addMany([
    {
        nome: 'User_1',
        admin: true
    },
    {
        nome: 'User_2',
        admin: false
    },
        {
        nome: 'User_3',
        admin: false
    }
])


// Consultando dados

const output1 = collection.find({
    where: obj => obj.admin === true
})
console.log("output1", output1);
// Resultado:
    [
        {
            "nome": "User_1",
            "admin": true,
            "_zid": 1
        }
    ]
//


const output2 = collection.find({
    where: obj => obj._zid > 2
})
console.log("output2", output2);
// Resultado:
    [
        {
            "nome": "User_3",
            "admin": false,
            "_zid": 3
        }
    ]
//


const output3 = collection.find({
    where: obj => obj.admin === false,
    hideInfo: ['admin', '_zid']
})
console.log("output3", output3);
// Resultado:
    [
        {
            "nome": "User_2",
        },
        {
            "nome": "User_3",
        }
    ]
//
```
<br>

### update
Altera um ou mais objetos dentro da Collection.

#### Syntax
```js
const optionsUpdate = {
    where: (obj) => {},
    values: { key: value }
}
collection.update(optionsUpdate)
```

#### Parâmetros
`optionsUpdate.where: function(obj) {}` *(obrigatório)*<br><br>Função callback que recebe como parâmetro os objetos contidos na Collection.<br>Seu retorno deve ser os objetos que serão atualizados;<br><br>
`optionsUpdate.values: { key: value }` *(obrigatório)*<br><br>Objeto chave-valor com os novos valores a serem atualizados;

#### Retorno
Array de objetos já com as novas alterações;

#### Exemplo
```js
// Adicionando dados
collection.addMany([
    {
        nome: 'User_1',
        admin: false
    },
    {
        nome: 'User_2',
        admin: false
    }
])


// Alterando dados

// Syntax JavaScript antiga:
const output = collection.update({
    where: function(obj) {
        if (obj.nome === 'User_1') {
            return obj
        }
    },
    values: { admin: true }
})


// Syntax JavaScript moderna:
const output = collection.update({
    where: obj => obj.nome === 'User_1',
    values: { admin: true }
})


// Syntax Typescript:
// Utiliza Generics para habilitar a tipagem dos objetos, incluindo a propriedade '_zid' como padrão.
type User = { nome: string, admin: boolean }
const output = collection.update<User>({
    where: (obj) => obj._zid === 1,
    values: { admin: true }
})


console.log("output: ", output);
// Em todos os exemplos o output segue o mesmo:
    [
        {
            "nome": "User_1",
            "admin": true,
            "_zid": 1
        },
        {
            "nome": "User_2",
            "admin": false,
            "_zid": 2
        }
    ]
//
```
<br>

### delete
Remove um ou mais objetos da Collection.

#### Syntax
```js
const optionsDelete = {
    where: (obj) => {}
}
collection.delete(optionsDelete)
```

#### Parâmetros
`optionsDelete.where: function(obj) {}` *(obrigatório)*<br><br>Função callback que recebe como parâmetro os objetos contidos na Collection.<br>Seu retorno deve ser os objetos que serão removidos;<br><br>

#### Retorno
Não possui retorno;

#### Exemplo
```js
// Adicionando dados
collection.addMany([
    {
        nome: 'User_1',
        admin: false
    },
    {
        nome: 'User_2',
        admin: false
    }
])


// Deletando dados

// Syntax JavaScript antiga:
collection.delete({
    where: function(obj) {
        if (obj.nome === 'User_1') {
            return obj
        }
    }
})


// Syntax JavaScript moderna:
collection.delete({
    where: obj => obj.nome === 'User_1'
})


// Syntax Typescript:
// Utiliza Generics para habilitar a tipagem dos objetos, incluindo a propriedade '_zid' como padrão.
type User = { nome: string, admin: boolean };
collection.delete<User>({
    where: obj => obj.nome === 'User_1'
})


console.log("collection.findAll(): ", collection.findAll());
// Em todos os exemplos o resultado segue o mesmo:
    [
        {
            "nome": "User_2",
            "admin": false,
            "_zid": 2
        }
    ]
//
```
<br>