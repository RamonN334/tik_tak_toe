export const createNewGame = () => {  
    const userName = $('#new-game-form #userName').val();
    const size = $('#new-game-form #size').val();
    $.ajax({
        method: 'POST',
        url: 'http://localhost:8001/games/new',
        contentType: 'application/json',
        crossDomain: true,
        processData: false,
        data: JSON.stringify({
            userName: userName,
            size: size
        }),
        success: (data) => {
            if (data.status == 'OK') {
                document.cookie = `accessToken=${data.accessToken}`;
                window.location.href = '/game';
            }
        }
    });
}

export const joinToGame = () => {
    let gameToken = $('#join-game-form #gameToken').val();
    let userName = $('#join-game-form #userName').val();

    $.ajax({
        method: 'POST',
        url: 'http://localhost:8001/games/join',
        contentType: 'application/json',
        crossDomain: true,
        processData: false,
        data: JSON.stringify({
            userName: userName,
            gameToken: gameToken
        }),
        success: (data) => {
            if (data.status == 'OK') {
                document.cookie = `accessToken=${data.accessToken}`;
                document.cookie = `userName=${userName}`;
                window.location.href = '/game';
            }
        }
    });
}

export const displayGames = () => {
    let gameDivs = [];
    $.ajax({
        url: 'http://localhost:8001/games/list',
        contentType: 'application/json',
        crossDomain: true,
        success: (data) => {
            let games = data['games'];
            $.each(games, (_, item) => {
                let gameDiv = '';
                gameDiv += `<div id=${item.gameToken} class="game-info">`;
                gameDiv += `<div class="owner"><span>${item.owner}</span><span class="winner"></span></div>`;
                gameDiv += '<hr>';
                gameDiv += `<div class="opponent"><span>${item.opponent || ''}</span><span class="winner"></span></div>`;
                gameDiv += `<div class="size"><span>${item.size}x${item.size}</span></div>`
                gameDiv += `<div class="game-duration"><span>${msToTime(item.gameDuration)}</span></div>`
                gameDiv += '</div>';
                gameDivs.push(gameDiv);
            });
            $('#games-list').html(gameDivs);
        }
    });
}