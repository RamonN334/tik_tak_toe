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
                if (data.state == 'ready') {
                    $('#current-state span').text('Waiting for another player...');
                }
                else {
                    $('#current-state span').text(data.yourTurn ? 'Your turn' : 'Move another player');
                }
                $('#owner span').html(data.owner || '');
                $('#opponent span').html(data.opponent || '');
                let table = '<table>';
                for (let i = 0; i < data.field.length; i++) {
                    table += '<tr>';
                    for (let j = 0; j < data.field[i].length; j++) {
                        table += `<td row=${i} col=${j}>`
                        console.log(`blabla: ${data.field[i]}`);
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
                    let row = $(td).attr('row');
                    let col = $(td).attr('col');
                    console.log(data.state);
                    if (data.state == 'playing') {
                        doStep(row, col);
                        console.log(`[${$(td).attr('row')}, ${$(td).attr('col')}]`);
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