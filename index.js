//importing express 
const express = require('express')

// importing morgan - middle ware
const morgan = require('morgan')

// importing cors - Cross-Origin Resource Sharing
const cors = require('cors')

// using express function to create express app
const app = express()
//json parser
app.use(express.json())
//using cors
app.use(cors())

//to check if the build directory contains a file corresponding to the request's address.
app.use(express.static('build'))

//using morgan
morgan.token('body', (request, response) => request.method === 'POST' ? JSON.stringify(request.body) : ' ')

app.use(morgan((tokens, request, response) => [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.body(request, response)
].join('')))


//import node's built in web server module 
// same as import http from 'http'
const http = require('http')

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const text =
        `<p>Phonebook has info for ${persons.length} peopnle </p>
        <p> ${new Date()}</p>`
    response.send(text)
})

//fetchig a single resource 
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id) //request object
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

    //response.json(note)
})

//deleteing resources 
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

// new entries
const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!request.body.number) {
        return response.status(400).json({
            error: 'numebr missing'
        })
    }

    // see if person is already added to phonebook 
    const foundPerson = persons.find(person => person.name === request.body.name)

    if (foundPerson) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: request.body.name,
        number: request.body.number
    }

    persons = persons.concat(person)

    response.json(person)
})



// const PORT = 3001
// app.listen(PORT) //binded app to the port 
// console.log(`Server running on port ${PORT}`)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})