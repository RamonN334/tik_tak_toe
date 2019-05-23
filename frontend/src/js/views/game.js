$(document).ready(() => {
    getGameState();
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
            console.log(data);
            if (data.status == 'OK') {
                $('#current-state span').text(getCurrentStats(data));
                $('#owner span').html(data.owner || '');
                $('#opponent span').html(data.opponent || '');
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
                            table += '<img src="../img/cross.jpg" width="100" height="auto">';
                            break;
                            case '0':
                            table += '<img src="../img/circle.jpg" width="100" height="auto">';
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
                    console.log(typeof row);
                    console.log(typeof col);
                    if (data.state == 'playing') {
                        doStep(row, col);
                    }
                });
            }
        }
    })
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
    switch(data.state) {
        case 'ready':
            currState = 'Waiting for another player...';
            break;
        case 'playing':
            currState = data.yourTurn ? 'Your turn' : 'Move another player';
            break;
        case 'done':
            currState = data.winner || 'draw';
    }

    return currState;
}