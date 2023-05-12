const mongoose = require('mongoose')
//importing express 
const express = require('express')
// using express function to create express app
const app = express()
// import .env file
require('dotenv').config()

// import model
const Person = require('./models/person')

// importing morgan - middle ware
const morgan = require('morgan')

// importing cors - Cross-Origin Resource Sharing
const cors = require('cors')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
//using cors
app.use(cors())
//json parser
app.use(express.json())
app.use(requestLogger)
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
    // {
    //     "id": 1,
    //     "name": "Arto Hellas",
    //     "number": "040-123456"
    // },
    // {
    //     "id": 2,
    //     "name": "Ada Lovelace",
    //     "number": "39-44-5323523"
    // },
    // {
    //     "id": 3,
    //     "name": "Dan Abramov",
    //     "number": "12-43-234345"
    // },
    // {
    //     "id": 4,
    //     "name": "Mary Poppendieck",
    //     "number": "39-23-6423122"
    // }
]


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// app.get('/api/persons', (request, response) => {
//     response.json(persons)
// })


// app.get('/info', (request, response) => {
//     const text =
//         `<p>Phonebook has info for ${persons.length} peopnle </p>
//         <p> ${new Date()}</p>`
//     response.send(text)
// })

app.get('/info', (request, response, next) => {
    const date = new Date().toString()
    Person.find({}).then(person => {
        response.send(`<p>Phonebook has info for ${person.length} people</p> <p>${date}</p>`)
    })
        .catch(error => { next(error) })
})


//fetchig a single resource 
// app.get('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id) //request object
//     const person = persons.find(person => person.id === id)

//     if (person) {
//         response.json(person)
//     } else {
//         response.status(404).end()
//     }
//     //response.json(note)
// })

// app.get('/api/persons/:id', (request, response) => {
//     Person.findById(request.params.id).then(person => {
//         response.json(person)
//     })
// })

// added error handling 
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end() // If no matching object is found in the database - resutl is null 
            }
        })
        // .catch(error => {
        //     console.log(error)
        //     //if promise returned by the findById method is rejected
        //     response.status(400).send({ error: 'malformatted id' })
        // })
        .catch(error => next(error))
})

//deleteing resources 
// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)

//     response.status(204).end()
// })

//usign the findbyidandremove fucntion
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    console.log(id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send({ error: 'Invalid id' });
    }

    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


//new entries
// const generateId = () => {
//     const maxId = persons.length > 0
//         ? Math.max(...persons.map(n => n.id))
//         : 0
//     return maxId + 1
// }

app.post('/api/persons', (request, response) => {
    const body = request.body

    // if (body.name === undefined) {
    //     return response.status(400).json({ error: 'content missing' })
    // }

    const person = new Person({
        name: request.body.name,
        number: request.body.number
    })


    if (!request.body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    // see if person is already added to phonebook 
    const foundPerson = persons.find(person => person.name === request.body.name)

    if (foundPerson) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    persons = persons.concat(person)

    // persons.save().then(person => {
    //     response.json(person)
    // })

    person.save().then(person => {
        console.log(`added ${person.name} ${person.number} to phonebook`)
        response.json(person)
        //mongoose.connection.close()
    })
})


app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})



const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// error handling middle ware
app.use(errorHandler)


// const PORT = 3001
// app.listen(PORT) //binded app to the port 
// console.log(`Server running on port ${PORT}`)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})