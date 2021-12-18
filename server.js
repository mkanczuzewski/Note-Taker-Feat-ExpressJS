const fs = require('fs');
const path = require('path');
const { query } = require('express');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
// parse incoming string or array data (needed everytime you POST on a server)
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data (needed everytime you POST on a server)
app.use(express.json());
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

app.post('/api/notes', (req, res) => 
{
    req.body.id = notes.length.toString();
    if (!validateNote(req.body)) 
    {
        res.status(400).send('The note is not properly formatted.');
    }
    else
    {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});


app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });