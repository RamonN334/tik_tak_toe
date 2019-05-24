'use strict';
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'src/tpl') });
});

app.get('/game', (req, res) => {
    res.sendFile('game.html', { root: path.join(__dirname, 'src/tpl') });
});

const port = 8000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));