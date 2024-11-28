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

app.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p><p>${date.toString()}</p>`
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
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
      newPerson.save().then(person => {
        response.json(person)
      })
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter(person => person.id !== request.params.id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
