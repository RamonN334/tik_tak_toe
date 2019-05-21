'use strict';
const uuid4 = require('uuid/v4');
const express = require('express');
const repository = require('../repository');
const router = express.Router();

// const app = express();
// app.use(express.urlencoded({extended: true}));

router.post('/new', (req, res) => {
    const userData = req.body;
    console.log(userData);
    if ('userName' in userData && 'size' in userData) {
        const accessToken = genUUID();
        const gameToken = genUUID();

        console.log(req.body);
        let newGame = {
            'owner': userData['userName'],
            'size': userData['size'],
            'gameStart': new Date(),
            'lastUpdate': new Date(),      
            'gameToken': gameToken,
            'state': 'ready'
        }

        let gameField = []
        for (let i = 0; i < newGame['size']; i++)  {
            gameField.push('?'.repeat(newGame['size']));
        }
        newGame['field'] = JSON.stringify(gameField);
        repository.insertIntoGames(newGame);
        repository.insertIntoGameSessions({
            'accessToken': accessToken,
            'gameToken': gameToken,
            'yourTurn': true
        });

        return res.send({
            'status': 'OK',
            'code': 0,
            'accessToken': accessToken,
            'gameToken': gameToken
        });
    }

    return res.send(errorResponse(1, 'Invalid request'));
});

router.get('/list', (req, res) => {
    // TO DO
    // Calculate game duration
    // console.log(`[INFO] ${new Date()}: GET to /games/list`);
    repository.getGames()
    .then(
        results => {
            let transformedResults = [];
            for (let game of results) {
                const item = {
                    'gameToken': game['gameToken'],
                    'owner': game['owner'],
                    'opponent': game['opponent'],
                    'size': game['size'],
                    'gameDuration': new Date() - game['gameStart'],
                    'gameResult': game['gameResult'],
                    'state': game['state']
                }
                transformedResults.push(item);
            }
            res.json({
                'status': 'OK',
                'code': 0,
                'games': transformedResults
            });
        },
        () => res.send(errorResponse(2, `Don't succeed to get games list`))
    );
});

router.post('/join', (req, res) => {
    // TO DO
    // If two players already play the game, then only visitors
    const userData = req.body;
    console.log(userData);
    if ('gameToken' in userData && 'userName' in userData) {
        const accessToken = genUUID();

        repository.getGameByGameToken(userData['gameToken'])
        .then((data) => {
            let game = data;
            console.log(`Result: ${data['state']}`);
            console.log(game['state']);
            if (game['state'] == 'playing') {
                repository.joinToGameAsObserver(userData['gameToken'], accessToken);
            }
            else {
                repository.joinToGameAsPlayer(userData['gameToken'], userData['userName'], accessToken);
            }

            res.json({
                'status': 'OK',
                'code': 0,
                'accessToken': accessToken
            });
        });
    }
    else {
        res.json(errorResponse(1, 'Invalid request'));
    }

});

router.post('/do_step', (req, res) => {
    // TO DO

    const accessToken = req.header('accessToken')
    console.log(accessToken);
    if (accessToken) {
        const userData = req.body;
        if ('row' in userData && 'col' in userData) {
            repository.getGameByPlayer(accessToken)
            .then((results) => {
                if (results) {
                    const row = userData['row'];
                    const col = userData['col'];
                    gameField = JSON.parse(results['field']);
                    gameField[row][col] = 'X';
                    console.log(results);   
                }
            })
            return res.send('OK');
        }

        return res.json(errorResponse(1, 'Invalid request'));
    }

    return res.json(errorResponse(3, `Not found accessToken in headers`));
});

router.get('/state', (req, res) => {
    // TO DO
    const accessToken = req.header('accessToken');
    console.log(accessToken);
    if (accessToken) {
        // TO DO
        // repo.getState
        console.log('done.');
        repository.getGameState(accessToken)
        .then((result) => {
            const resData = {
                'status': 'OK',
                'code': 0,
                'gameDuration': new Date() - result[0]['gameStart'],
                'field': JSON.parse(result[0]['field'])
            }
            // res.json(resData);
            res.json(resData);
            // res.json(resData);
        },
        () => res.send(errorResponse(4, `Error with query at database`)));
    }
    else {
        res.send(errorResponse(3, `Not found accessToken in headers`));
    }
});

module.exports = router;

const errorResponse = (code, msg) => { return {'status': 'error', 'code': code, 'message': msg}};
const genUUID = () => uuid4();