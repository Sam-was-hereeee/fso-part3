require('dotenv').config();

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const People = require('./../db/peopledb.js')
const {response} = require("express");


app.use(cors())
app.use(express.static('dist'))
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

app.get('/info', (request, response, next) => {
    const requestTime = new Date();
    People.find({}).then((res)=>{console.log(res);});
    People.countDocuments({}).then((itemCnt)=>{
        let responseMsg = `
        <div>Phonebook had info for ${itemCnt} people</div><br>
        <p>${String(requestTime)}</p>
    `;
        response.send(responseMsg);

    }).catch(err=>{next(err)})
})

app.get('/api/persons', (request, response,next) => {
    console.log('requested full persons')
    People.find({}).then(persons=>{
        response.json(persons)
    }).catch(err=>{next(err)})
})
app.post('/api/persons', (request, response,next) => {
    console.log(`received person ${typeof(request.body)}`);
    const body = request.body;
    People.find({}).then(personsList=>{
        if (!body.name || !body.number) {
            response.status(400).send({error: 'name or number is required'});
            return;
        } else if (personsList.find((person) => person.name === body.name)) {
            response.status(400).send({error: 'person already exists'});
            return;
        }
        const newPerson = new People ({
            "name": String(body.name),
            "number": String(body.number)
        })
        newPerson
            .save()
            .then(savedPerson=>{response.json(savedPerson)})
            .catch(err=>{next(err)})
    })

})

app.get('/api/persons/:id', async (request, response, next) => {
    console.log('requested one person');
    const requestId = request.params.id;
    try {
        const foundPerson = await People.findById(requestId).exec();
        if (!foundPerson) {response.status(404).send('No such person');return;}
        response.json(foundPerson);
    } catch (err) {
        next(err)
    }
})
app.delete('/api/persons/:id', async (request, response, next) => {
    const requestId = request.params.id;
    try {
        const foundPerson = await People.findByIdAndDelete(requestId).exec()
        if (!foundPerson) {response.status(404).send('No such person');return;}
        response.status(204).send('deleted successfully');
    } catch (err) {
        next(err);
    }
})

app.put('/api/persons/:id', async (request, response, next) => {
    try {
        const requestId = request.params.id;
        const body = request.body;
        const foundPerson = await People.findById(requestId).exec();
        if (!foundPerson) {response.status(404).send('No such person');return;}
        const person = {
            name: body.name,
            number: body.number
        };
        const result = await People.findByIdAndUpdate(
            requestId,
            person,
            {new:true, runValidators:true});
        response.json(result);
    } catch (err) {
        next(err);
    }
})

const unknownEndpoint = (_req, res) => {
    res.status(404).send({error: 'No such entry with this endpoint'});
}

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
    console.log("handling error:", err);
    if (err.name === "CastError") {
        return res.status(400).send({error: 'Invalid id format'});
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({err});
    }
    next(err);
}

app.use(errorHandler);

const PORT = process.env.PORT||3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})