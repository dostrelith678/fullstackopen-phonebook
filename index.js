const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

app.get('/info', (request, response) => {
  const date = new Date()

  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people</p><p>${date.toString()}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const person = persons.find(person => person.id === request.params.id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body
  if (!name || !number) {
    response.status(400).json({ error: 'name and number are required' })
  }
  const exists = persons.find(person => person.name === name)
  if (exists) {
    response.status(400).json({ error: 'name must be unique' })
  }
  const newId = String(Math.floor(Math.random() * 99999999999))
  const newPerson = { name, number, id: newId }
  persons = persons.concat(newPerson)

  response.status(201).json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter(person => person.id !== request.params.id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
