// import msToTime from '../timeConverter'
'use strict';
$(document).ready(() => {
    getGameState();
    $('#action-btn').click(backToMainPage);
    setInterval(getGameState, 2000);
});

const getGameState = () => {
    $.ajax({
        url: 'http://localhost:8001/games/state',
        contentType: 'application/json',
        crossDomain: true,
        headers: {
            'accessToken': getCookie('accessToken')
        },
        success: (data) => {
            if (data.status == 'OK') {
                getCurrentStats(data);
                let table = '<table>';
                for (let i = 0; i < data.field.length; i++) {
                    table += '<tr>';
                    for (let j = 0; j < data.field[i].length; j++) {
                        table += `<td row=${i} col=${j}>`
                        switch (data.field[i][j]) {
                            case '?':
                            table += '';
                            break;
                            case 'X':
                            table += '<img src="../img/cross.jpg" width="60" height="auto">';
                            break;
                            case '0':
                            table += '<img src="../img/circle.jpg" width="60" height="auto">';
                            break;
                        }
                        table += `</td>`;
                    }
                    table += '</tr>';
                }
                table += '</table>';
                $('#field').html(table);
                $('#field table').on('click', 'td', (event) => {
                    let td = event.currentTarget;
                    let row = +$(td).attr('row');
                    let col = +$(td).attr('col');
                    if (data.state == 'playing') {
                        doStep(row, col);
                    }
                });
            }
        }
    })
}

const backToMainPage = () => {
    window.location.href = '/';
}

const doStep = (row, col) => {
    $.ajax({
        url: 'http://localhost:8001/games/state',
        contentType: 'application/json',
        crossDomain: true,
        headers: {
            'accessToken': getCookie('accessToken')
        },
        success: (data) => {
            if (data.status == 'OK') {
                if (data.yourTurn) {
                    $.ajax({
                        url: 'http://localhost:8001/games/do_step',
                        method: 'POST',
                        contentType: 'application/json',
                        crossDomain: true,
                        headers: {
                            'accessToken': getCookie('accessToken')
                        },
                        data: JSON.stringify({
                            'row': row,
                            'col': col
                        }),
                        success: () => {getGameState();}
                    });
                }
            }
        }
    });
}

const getCookie = (name) => {
    // alert(document.cookie);
    let cookie = document.cookie.split('; ').filter(item => item.startsWith(`${name}=`));
    if (cookie[0]) {
        return cookie[0].split('=')[1] || '';
    }
    return '';
}

const getCurrentStats = (data) => {
    let currState = '';
    let actionBtnText = ''
    switch(data.state) {
        case 'ready':
            currState = 'Waiting for another player...';
            break;
        case 'playing':
            currState = data.yourTurn ? 'Your turn' : 'Move another player';
            actionBtnText = 'Surrender';
            break;
        case 'done':
            currState = data.winner || 'draw';
            actionBtnText = 'Back';
    }

    $('#owner span.player-username').html(data.owner || '');
    $('#opponent span.player-username').html(data.opponent || '');
    $('#game-time-duration').text(msToTime(data.gameDuration));
    $('#current-state span').text(currState);
    $('#action-btn span').text(actionBtnText);
}

const msToTime = duration => {
    let seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}