$(document).ready(() => {
    getGameState();
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
                $('#owner span').html(getCookie('userName'));
                $('#opponent span').html(data.owner || '');
                let table = '<table>';
                for (let row of data.field) {
                    table += '<tr>';
                    for (let col of row) {
                        table += '<td></td>';
                    }
                    table += '</tr>';
                }
                table += '</table>';
                $('#field').html(table);
            }
        }
    })
}

const getCookie = (name) => {
    // alert(document.cookie);
    let cookie = document.cookie.split('; ').filter(item => item.startsWith(`${name}=`));
    if (cookie[0]) {
        return cookie[0].split('=')[1] || '';
    }
    return '';
}