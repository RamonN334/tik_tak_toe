'use strict';
const uuid4 = require('uuid/v4');
const express = require('express');
const repository = require('../repository');
const router = express.Router();

router.post('/new', (req, res) => {
    const userData = req.body;
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
            'userName': userData['userName'],
            'yourTurn': true,
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
        () => res.send(errorResponse(2, `Don't succeed to get games list`))
    );
});

router.post('/join', (req, res) => {
    const userData = req.body;
    if ('gameToken' in userData && 'userName' in userData) {
        const accessToken = genUUID();
        repository.getGameByGameToken(userData['gameToken'])
        .then((data) => {
            let game = data;
            if (game['state'] == 'playing') {
                repository.joinToGameAsObserver(userData['gameToken'], userData['userName'], accessToken);
            }
            else {
                repository.joinToGameAsPlayer(userData['gameToken'], userData['userName'], accessToken);
            }

            repository.updateGameData(userData['gameToken'], {lastUpdate: new Date()});

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
    const accessToken = req.header('accessToken')
    if (accessToken) {
        const userData = req.body;
        if ('row' in userData && 'col' in userData) {
            repository.getGameByPlayer(accessToken)
            .then((game) => {
                if (game) {
                    repository.getPlayer(accessToken)
                    .then((player) => {
                        const row = +userData['row'];
                        const col = +userData['col'];
                        let gameField = JSON.parse(game['field']);
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
                        let winner = checkWinner(gameField);
                        switch (winner) {
                            case 'owner':
                                console.log('owner');
                                // repo.endGame(owner, winnerUsername)
                                break;
                            case 'opponent':
                                console.log('opponent');
                                // repo.endGame(opponent, winnerUsername)
                                break;
                            case 'draw':
                                console.log('draw');
                                // repo.endGame(draw)
                                break;
                        }

                        res.json({
                            'status': 'OK',
                            'code': 0
                        })
                    });
                }
            });
        }
        else {
            res.json(errorResponse(1, 'Invalid request'));
        }
    }
    else {
        res.json(errorResponse(3, `Not found accessToken in headers`));
    }
});

router.get('/state', (req, res) => {
    const accessToken = req.header('accessToken');
    if (accessToken) {
        repository.getGameState(accessToken)
        .then((result) => {
            // console.log(result);
            const resData = {
                'status': 'OK',
                'code': 0,
                'yourTurn': result['yourTurn'],
                'gameDuration': new Date() - result['gameStart'],
                'owner': result['owner'],
                'opponent': result['opponent'],
                'state': result['state'],
                'field': JSON.parse(result['field'])
            }
            res.json(resData);
        },
        () => res.send(errorResponse(4, `Error with query at database`)));
    }
    else {
        res.send(errorResponse(3, `Not found accessToken in headers`));
    }
});

const errorResponse = (code, msg) => { return {'status': 'error', 'code': code, 'message': msg}};
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
        console.log(`row: ${row}`);
        if (~row.indexOf('?')) {
            console.log('done');
            return '';
        }
    }
    return 'draw';
}

module.exports = router;