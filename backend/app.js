'use strict';
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(morgan('combined'));

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, accesstoken");
    next();
 });

app.use(express.static(path.join(__dirname, 'public')));

const gamesRouter = require('./routes/games');
app.use('/games', gamesRouter);

const port = 8001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;