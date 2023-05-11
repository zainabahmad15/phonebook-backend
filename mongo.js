const mongoose = require('mongoose')

const password = process.argv[2]

// // `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/phonebook?retryWrites=true&w=majority`
const url =
    `mongodb+srv://fullstack:${password}@clusterpb.ulpcxzx.mongodb.net/phonebook?retryWrites=true&w=majority`
// const url = process.env.MONGODB_URI

//define schema
//tells Mongoose how the person objects are to be stored in the database
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)

//define matching model
const Person = mongoose.model('Person', personSchema)


mongoose.set('strictQuery', false)

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })
//creates a new person object with the help of the Person model
const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
})


if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}
else if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

else if (process.argv.length === 5) {
    person.save().then(result => {
        console.log(`added ${person.name} ${person.number} to phonebook`)
        mongoose.connection.close()
    })

}



// person.save().then(result => {
//     console.log(`added ${person.name} ${person.number} to phonebook`)
//     mongoose.connection.close()
// })


// Person.find({}).then(result => {
//     result.forEach(person => {
//         console.log(person)
//     })
//     mongoose.connection.close()
// })
