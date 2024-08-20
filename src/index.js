const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
morgan.token('post-content', (req, res)=>{
    if (req.method !== 'POST') {return;}
    return JSON.stringify(req.body);
})
app.use(morgan((tokens, req, res)=>{
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['post-content'](req, res)
    ].join(' ');
}))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const randomIdGen = () => {
    return Math.floor(Math.random() * 1000000)
}

app.get('/', (req, res) => {
    const requestTime = new Date()
    let responseMsg = `
        <div>Phonebook had info for ${persons.length} people</div><br>
        <p>${String(requestTime)}</p>
    `;
    res.send(responseMsg);
})

app.get('/info', (request, response) => {
    const requestTime = new Date()
    let responseMsg = `
        <div>Phonebook had info for ${persons.length} people</div><br>
        <p>${String(requestTime)}</p>
    `;
    response.send(responseMsg);
})

app.get('/api/persons', (request, response) => {
    console.log('requested full persons')
    response.json(persons)
})
app.post('/api/persons', (request, response) => {
    console.log(`received person ${typeof(request.body)}`);
    const body = request.body;
    if (!body.name || !body.number) {
        response.status(400).send({error: 'name or number is required'});
        return;
    } else if (persons.find((person) => person.name === body.name)) {
        response.status(400).send({error: 'person already exists'});
        return;
    }
    const newPerson = {
        "name": String(body.name),
        "number": String(body.number),
        "id": String(randomIdGen())
    }
    persons.push(newPerson)
    response.json(newPerson)
})

app.get('/api/persons/:id', (request, response) => {
    console.log('requested one person');
    const requestId = request.params.id;
    const foundPerson = persons.find(person => person.id === requestId);
    if (!foundPerson) {response.status(404).send('No such person');return;}
    response.json(foundPerson);
})
app.delete('/api/persons/:id', (request, response) => {
    console.log(`deleted ${request.params.id}`);
    const requestId = request.params.id;
    if (!persons.find(person => person.id === requestId)) {
        response.status(404).send('No such person');
        return;
    }
    persons = persons.filter(person => person.id !== requestId);
    response.status(204).send('deleted successfully');
})

const PORT = process.env.PORT||3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})