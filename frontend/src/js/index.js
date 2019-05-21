$(document).ready(() => {
    displayGames();

    $('.game-info').each((_, item) => {
        console.log(item);
    });

    let modal = $('#myModal');

    $('#myBtn').click(() => {
        
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
});

const displayGames = () => {
    let gameDivs = [];
    // $.ajaxOptions(() ={
    //     headers: {
    //         'Content-type': 'application/json'
    //     }
    // })
    $.ajax({
        url: 'http://localhost:8001/games/list',
        contentType: 'application/json',
        crossDomain: true,
        success: (data) => {
            let games = data['games'];
            $.each(games, (_, item) => {
                let gameDiv = '';
                gameDiv += '<div class="game-info">';
                gameDiv += `<div class="owner"><span>${item.owner}</span><span class="winner"></span></div>`;
                gameDiv += '<hr>';
                gameDiv += `<div class="opponent"><span>${item.opponent || ''}</span><span class="winner"></span></div>`;
                gameDiv += `<div class="game-duration"><span>${msToTime(item.gameDuration)}</span></div>`
                gameDiv += '</div>';
                gameDivs.push(gameDiv);
            });
            $('#games-list').html(gameDivs);
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



