'use strict';
const uuid4 = require('uuid/v4');
const express = require('express');
const repository = require('../repository');
const router = express.Router();

router.post('/new', (req, res) => {
    const userData = req.body;
    if ('userName' in userData && 'size' in userData) {
        if (!userData['userName']) return res.json(errorResponse(5, 'UserName field is empty'));
        if (!isNumeric(userData['size'])) return res.json(errorResponse(5, 'Size field is not valid'));
        if (+userData['size'] < 3) return res.json(errorResponse(5, 'Size value is less than 3'));

        const accessToken = genUUID();
        const gameToken = genUUID();

        let newGame = {
            'owner': userData['userName'],
            'size': +userData['size'],
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
        repository.createGame(newGame);
        repository.createGameSession({
            'accessToken': accessToken,
            'gameToken': gameToken,
            'userName': userData['userName'],
            'yourTurn': true,
        });

        return res.json({
            'status': 'OK',
            'code': 0,
            'accessToken': accessToken,
            'gameToken': gameToken
        });
    }
    else return res.json(errorResponse(1, 'Invalid request'));
});

router.get('/list', (req, res) => {
    repository.getGames()
    .then(
        results => {
            let transformedResults = [];
            let notActiveGames = [];
            for (let game of results) {
                let gameDurationWihoutUpdate = new Date() - game['lastUpdate'];
                if (gameDurationWihoutUpdate < 300000) {
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
                else {
                    notActiveGames.push(game['gameToken']);
                }
                if (notActiveGames.length != 0) {
                    repository.deleteNotActiveGames(notActiveGames);
                }
            }
            res.json({
                'status': 'OK',
                'code': 0,
                'games': transformedResults
            });
        },
        () => { return res.send(errorResponse(2, 'Don\'t succeed to get games list')); }
    );
});

router.post('/join', (req, res) => {
    const userData = req.body;
    if ('gameToken' in userData && 'userName' in userData) {
        if (!userData['gameToken']) return res.json(errorResponse(5, 'GameToken field is empty'));
        if (!userData['userName']) return res.json(errorResponse(5, 'UserName field is empty'));
        const accessToken = genUUID();
        repository.getGameByGameToken(userData['gameToken'])
        .then((data) => {
            if (data.length == 0) return res.json(errorResponse(2, 'Not found active game'));
            let game = data[0];
            if (game['state'] == 'playing') {
                repository.joinToGameAsObserver(userData['gameToken'], userData['userName'], accessToken);
            }
            else {
                repository.joinToGameAsPlayer(userData['gameToken'], userData['userName'], accessToken);
                repository.updateGameData(userData['gameToken'], {state: 'playing', lastUpdate: new Date()});
            }

            return res.json({
                'status': 'OK',
                'code': 0,
                'accessToken': accessToken
            });
        });
    }
    else return res.json(errorResponse(1, 'Invalid request'));
});

router.post('/do_step', (req, res) => {
    const accessToken = req.header('accessToken')
    if (accessToken) {
        const userData = req.body;
        if ('row' in userData && 'col' in userData) {
            if (!isNumeric(userData['row'])) return res.json(errorResponse(5, 'Row value is not valid'));
            if (!isNumeric(userData['col'])) return res.json(errorResponse(5, 'Col value is not valid'));

            repository.getGameByPlayer(accessToken)
            .then((foundGames) => {
                if (foundGames.length == 0) return res.json(errorResponse(2, 'Not found active game'));
                const game = foundGames[0];
                if (game.state != 'playing') return res.json(errorResponse(6, 'The game has not started yet'));
                repository.getPlayer(accessToken)
                .then((foundPlayers) => {
                    if (foundPlayers.length == 0) return res.json(errorResponse(2, 'Not found player'));
                    const player = foundPlayers[0];
                    if (!player.yourTurn) return res.json(errorResponse(6, 'Now the turn is not this player'));
                    const row = +userData['row'];
                    const col = +userData['col'];
                    let gameField = JSON.parse(game['field']);
                    if (row > gameField.length || col > gameField.length) 
                        return res.json(errorResponse(5, 'Row or col values are more than field size'));
                    if (gameField[row][col] != '?') return res.json(errorResponse(6, 'The cell is already occupied'));
                    let s = gameField[row];
                    gameField[row] = s.slice(0, col) + player['yourSign'] + s.slice(col + 1);
                    repository.updateGameData(
                        game['gameToken'], 
                        {
                            field: JSON.stringify(gameField),
                            lastUpdate: new Date()
                        }
                    );
                    repository.switchActivePlayer(accessToken, game['gameToken']);
                    let result = checkWinner(gameField);
                    switch (result) {
                        case 'owner':
                            repository.updateGameData(
                                game['gameToken'], 
                                {
                                    state: 'done', 
                                    winner: game['owner'],
                                    gameResult: result
                                }
                            );
                            break;
                        case 'opponent':
                            repository.updateGameData(
                                game['gameToken'], 
                                {
                                    state: 'done', 
                                    winner: game['opponent'],
                                    gameResult: result
                                }
                            );                             
                            break;
                        case 'draw':
                            repository.updateGameData(
                                game['gameToken'], 
                                {
                                    state: 'done', 
                                    gameResult: result
                                }
                            );                                
                            break;
                    }

                    return res.json({
                        'status': 'OK',
                        'code': 0
                    });
                });
            });
        }
        else return res.json(errorResponse(1, 'Invalid request'));
    }
    else return res.json(errorResponse(3, `Not found accessToken in headers`));
});

router.get('/state', (req, res) => {
    const accessToken = req.header('accessToken');
    if (accessToken) {
        repository.getGameState(accessToken)
        .then((results) => {
            if (results.length == 0) return res.json(errorResponse(2, 'Not found active game'));
            const state = results[0];
            const resData = {
                'status': 'OK',
                'code': 0,
                'yourTurn': state['yourTurn'],
                'gameDuration': new Date() - state['gameStart'],
                'owner': state['owner'],
                'opponent': state['opponent'],
                'state': state['state'],
                'winner': state['winner'],
                'field': JSON.parse(state['field'])
            }
            res.json(resData);
        },
        () => { return res.json(errorResponse(4, `Error with query at database`)); }
        )
    }
    else return res.json(errorResponse(3, `Not found accessToken in headers`));
});

const isNumeric = (n) => {return !isNaN(parseFloat(n)) && isFinite(n);};
const errorResponse = (code, msg) => {return {'status': 'error', 'code': code, 'message': msg}};
const genUUID = () => uuid4();
const checkWinner = (field) => {
    const transpose = (field) => {
        let transposeField = new Array(field.length);
        transposeField.fill('');
        for (let row of field) {
            row = row.split('').reverse().join('');
            for (let i = 0; i < row.length; i++) {
                transposeField[i] += row[i];
            }
        }
        return transposeField;
    }

    const checkHorizontalLine = (field) => {
        for (let row of field) {
            if (row === 'X'.repeat(row.length)) {
                return 'owner'
            }
            if (row === '0'.repeat(row.length)) {
                return 'opponent';
            }
        }
        return '';
    }

    const getDiagonal = (field) => {
        let mainDiagonal = '';
        for (let i = 0; i < field.length; i++) {
            mainDiagonal += field[i][i];
        }
        return [mainDiagonal];
    }

    let winner = checkHorizontalLine(field);
    if (winner) return winner;

    winner = checkHorizontalLine(transpose(field));
    if (winner) return winner;

    winner = checkHorizontalLine(getDiagonal(field));
    if (winner) return winner;

    winner = checkHorizontalLine(getDiagonal(transpose(field)));
    if (winner) return winner;

    for (let row of field) {
        if (~row.indexOf('?')) {
            return '';
        }
    }
    return 'draw';
}

module.exports = router;