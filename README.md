# KlauzDB [![NPM version](https://img.shields.io/npm/v/klauz-db.svg?style=flat-square)](https://www.npmjs.com/package/klauz-db)

KlauzDB é um banco de dados orientado a Collections projetado para oferecer uma solução leve e eficiente para a persistência de dados locais. Utilizando arquivos .json como seu meio de armazenamento, ele permite que desenvolvedores manipulem dados estruturados de maneira intuitiva e acessível.

Com suporte a operações CRUD *(Criar, Ler, Atualizar e Deletar)*, o sistema permite a categorização de dados em coleções, facilitando a realização de consultas de forma ágil e adaptável. A estrutura em JSON garante que os dados sejam facilmente legíveis e interoperáveis com diversas linguagens de programação.

Ideal para aplicações que exigem uma solução simples e eficaz de armazenamento, este banco de dados é perfeito para protótipos, projetos de pequeno a médio porte, testes automatizados e ambientes de desenvolvimento, proporcionando agilidade no gerenciamento de informações.
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

No começo da sua aplicação, importe o pacote "klauz-db" e defina o path principal para armazenamento dos dados:

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
Habilita uma nova instância Collection, e cria seu arquivo .json para persistência dos dados.

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
    path: './db'
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

Com sua Collection criada agora você já tem acesso as seguintes funções de db:
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
Adiciona um novo objeto dentro da Collection.

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
Adiciona um novo array de objetos dentro da Collection.

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
`optionsFindAll.hideInfo: Array<string>` *(opcional)*<br><br>Array contendo as informações que necessita esconder do retorno da função.<br><br>

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
Retorna dados específicos que estão contidos na Collection.

#### Syntax
```js
const optionsFind = {
    where: (obj) => {},
    hideInfo?: Array<string>
}
collection.find(optionsFind)
```

#### Parâmetros
`optionsFind.where: function(obj) {}` *(obrigatório)*<br><br>Função callback que recebe como parâmetro os objetos contidos na Collection.<br>Seu retorno deve ser os objetos que serão consultados;<br><br>
`optionsFind.hideInfo: Array<string>` *(opcional)*<br><br>Array contendo as informações que necessita esconder do retorno da função.<br><br>

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

//Syntax Javascript antiga
const antigo = collection.find({
    where: function(obj) {
        if (obj.admin === true) {
            return obj
        }
    }
})

//Syntax Javascript moderna (recomendado)
const moderno = collection.find({
    where: obj => obj.admin === true
})

// Syntax Typescript:
// Utiliza Generics para habilitar a tipagem dos objetos, incluindo a propriedade '_zid' como padrão.
type User = { nome: string, admin: boolean };
const typescript = collection.find<User>({
    where: obj => obj.admin === true
})

console.log("antigo", antigo);
console.log("moderno", moderno);
console.log("typescript", typescript);
// Resultado:
    [
        {
            "nome": "User_1",
            "admin": true,
            "_zid": 1
        }
    ]
//

const output1 = collection.find({
    where: obj => obj._zid > 2
})

console.log("output1", output1);
// Resultado:
    [
        {
            "nome": "User_3",
            "admin": false,
            "_zid": 3
        }
    ]
//

const output2 = collection.find({
    where: obj => obj.admin === false,
    hideInfo: ['admin', '_zid']
})

console.log("output2", output2);
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

// JavaScript:
const output1 = collection.update({
    where: obj => obj.nome === 'User_1',
    values: { admin: true }
})


// Typescript:
type User = { nome: string, admin: boolean }
const output2 = collection.update<User>({
    where: (obj) => obj._zid === 1,
    values: { admin: true }
})


console.log("output1: ", output1);
console.log("output2: ", output2);
// Resultado:
    [
        {
            "nome": "User_1",
            "admin": true,
            "_zid": 1
        }
    ]
//


// Update inserindo nova informação
const output3 = collection.update({
    where: obj => obj.nome === 'User_2',
    values: { idade: 20 }
})

console.log("output3: ", output3);
// Resultado:
    [
        {
            "nome": "User_2",
            "admin": false,
            "idade": 20,
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
    },
    {
        nome: 'User_3',
        admin: false
    }
])


// Deletando dados

console.log("collection.findAll(): ", collection.findAll());
// Consulta antes:
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
        },
        {
            "nome": "User_3",
            "admin": false,
            "_zid": 3
        }
    ]
//


// JavaScript:
collection.delete({
    where: obj => obj.nome === 'User_1'
})


// Typescript:
type User = { nome: string, admin: boolean };
collection.delete<User>({
    where: obj => obj._zid === 1
})


console.log("collection.findAll(): ", collection.findAll());
// Consulta depois:
    [
        {
            "nome": "User_2",
            "admin": false,
            "_zid": 2
        },
        {
            "nome": "User_3",
            "admin": false,
            "_zid": 3
        }
    ]
//
```
<br>

### reset
Apaga todos os dados inseridos na Collection.

#### Syntax
```js
collection.reset()
```

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


// Resetando os dados

console.log("collection.findAll(): ", collection.findAll());
// Consulta antes:
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

collection.reset()

console.log("collection.findAll(): ", collection.findAll());
// Consulta depois:
    []
//
```
<br>

### drop
Deleta o arquivo .json criado para a Collection.

#### Syntax
```js
collection.drop()
```

#### Retorno
Não possui retorno;

#### Exemplo
```js
// Criando Collection
const kz = new KlauzDB({
    path: '.'
})

const collection = kz.createCollection('teste') // arquivo .json criado

collection.drop() // arquivo .json deletado
```
<br>

## ✒️ Autores

* **Desenvolvedor** - *Trabalho & Documentação* - [Victor Nikolaus](https://github.com/vnikolaus)