const fs = require('fs');
const path = require('path');
const { query } = require('express');
const express = require('express');
const PORT = process.env.PORT || 3001;
var lodashDelete = require('lodash');
const app = express();


//middleware, parse incoming string or array data (needed everytime you POST on a server)
app.use(express.urlencoded({ extended: true }));
//middleware, parse incoming JSON data (needed everytime you POST on a server)
app.use(express.json());
//middleware, to serve the public files
app.use(express.static('public'));
const { notes } = require('./db/db');

//break out filter function from group get request
function filterByQuery(query, notesArray) 
{
    let filteredResults = notesArray;
    if (query.title) 
    {
        filteredResults = filteredResults.filter(notes => notes.title === query.title);
    }
    if (query.text) 
    {
        filteredResults = filteredResults.filter(notes => notes.text === query.text);
    }
    return filteredResults;
};

//break out filter function from id get request
function findById(id, notesArray)
{
    const result = notesArray.filter(notes => notes.id === id)[0];
    return result;
}

function createNewNote(body, notesArray) 
{
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
    return note;
}

function validateNote(note) 
{
    if (!note.title || typeof note.title !== 'string') 
    {
        return false;
    }
    if (!note.text || typeof note.text !== "string")
    {
        return false;
    }
    return true;
}

//retrieve entire notes array of objects
app.get('/api/notes', (req, res) => 
{
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

//retrieve a single id instance of the notes array
app.get('/api/notes/:id', (req, res) => 
{
    const result = findById(req.params.id, notes);
    if (result) 
    {
        res.json(result);
    }
    else
    {
        res.send(404);
    }
});

//save data back to JSON
app.post('/api/notes', (req, res) => 
{
    req.body.id = notes.length.toString();
    if (!validateNote(req.body)) 
    {
        res.status(400).send('The note is not properly formatted.');
    }
    else
    {
        // set id based on what the next index of the array will be
        req.body.id = notes.length.toString();
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

//HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// This is a wild card route incase someone tries to go somewhere that doesnt exist. 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });

app.delete('/api/notes/:id', (req, res) => 
{
    var index = lodashDelete.findIndex(notes, {id: req.params.id})
    notes.splice(index,1);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notes }, null, 2)
    );
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });