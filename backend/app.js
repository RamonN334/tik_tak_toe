'use strict';
const express = require('express');
const path = require('path');
const gamesRouter = require('./routes/games');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });

app.use(express.static(path.join(__dirname, 'public')));

app.use('/games', gamesRouter);

app.get('/', (req, res) => res.render('index'));

const port = 8001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));