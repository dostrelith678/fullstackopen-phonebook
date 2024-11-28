const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

const url = process.env.MONGODB_URI

app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/info', (request, response, next) => {
  const date = new Date()
  Person.find({})
    .then(persons => {
      response.send(
        `<p>Phonebook has info for ${
          persons.length
        } people</p><p>${date.toString()}</p>`
      )
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body
  if (!name || !number) {
    response.status(400).json({ error: 'name and number are required' })
  }

  Person.find({ name }).then(persons => {
    if (persons.length > 0) {
      response.status(400).json({ error: 'name must be unique' })
    } else {
      const newPerson = Person({
        name,
        number
      })
      newPerson
        .save()
        .then(person => {
          response.json(person)
        })
        .catch(error => {
          next(error)
        })
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  return response.status(500).end()
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
