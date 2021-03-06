// import msToTime from './timeConverter'

$(document).ready(() => {
    displayGames();
    $('#games-list').on('click', '.game-info', (event) => {
        let el = event.currentTarget;
        if (el) {
            $('#join-game-modal').css('display', 'block');
            $('#join-game-modal #gameToken').val($(el).attr('id'));
            $('span.close').click(() => {
                $('#join-game-modal').css('display', 'none');
            });
        
            $(window).click((event) => {
                if (event.target ==  $('#join-game-modal')) {
                    $('#join-game-modal').css('display', 'none');
                }
            });
        }
    });

    addEventToModal('new-game-modal', 'new-game');

    $('#join-game-modal #join-game').click(joinToGame);
    $('#create-game').click(createNewGame);
    setInterval(displayGames, 2000);
});

const createNewGame = () => {
    
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


const joinToGame = () => {
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

const displayGames = () => {
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
                if (item.gameResult == 'owner') {
                    gameDiv += `<div class="owner winner"><span>${item.owner}</span>`;
                    gameDiv += `<span class="check-mark">&#10004;</span>`;
                }
                else {
                    gameDiv += `<div class="owner"><span>${item.owner}</span>`;
                }
                gameDiv += `</div>`;
                gameDiv += '<hr>';
                if (item.gameResult == 'opponent') {
                    gameDiv += `<div class="opponent winner"><span>${item.opponent || ''}`;
                    gameDiv += `<span class="check-mark">&#10004;</span>`;
                }
                else {
                    gameDiv += `<div class="opponent"><span>${item.opponent || ''}`;
                }
                gameDiv += `</div>`;
                gameDiv += `<div class="size"><span>${item.size}x${item.size}</span></div>`
                gameDiv += `<div class="game-duration"><span>${msToTime(item.gameDuration)}</span></div>`
                gameDiv += '</div>';
                gameDivs.push(gameDiv);
            });
            $('#games-list').html(gameDivs);
        }
    });
}

const addEventToModal = (modalId, clickedElementId) => {
    let modal = $(`#${modalId}`);
    
    $(`#${clickedElementId}`).click(() => {
        
        modal.css('display', 'block');
    });

    $('span.close').click(() => {
        modal.css('display', 'none');
    });

    $(window).click((event) => {
        if (event.target == modal) {
            modal.css('display', 'none');
        }
    });
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