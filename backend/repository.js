const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'db',
  user: 'test_user',
  password: 'test_user',
  database: 'ttt_db'
})

module.exports = {
  insertIntoGames: (data) => {
    connection.query(
      `INSERT INTO games SET ?`, 
      data, 
      (error, results, fields) => {
        if (error) throw error;
        console.log(results.affectedRows);
      }
    );
  },

  insertIntoGameSessions: (data) => {
    connection.query(
      `INSERT INTO gameSessions SET ?`, 
      data, 
      (error, results, fields) => {
        if (error) throw error;
        console.log(results.affectedRows);
      }
    );
  },

  getGames: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM games`, 
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
        }
      );
    });
  },

  getGameByPlayer: (accessToken) => {
    console.log(accessToken);
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM games 
        JOIN gameSessions AS gs ON games.gameToken = gs.gameToken AND gs.accessToken = ?`,
        [accessToken],
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
        }
      );
    });
  },

  joinPlayerToGame: (gameToken, userName, accessToken) => {
    connection.query(
      `UPDATE games SET opponent = ?, state = "playing" WHERE gameToken = ?`, 
      [userName,  gameToken], 
      (error, results, fields) => {
        if (error) throw error;
        console.log(results.affectedRows);
      }
    );

    module.exports.insertIntoGameSessions({
      'accessToken': accessToken,
      'gameToken': gameToken,
      'yourSign': '0'
    });
  },

  getGameState: (accessToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT g.gameStart, g.gameResult, g.state, g.field, gs.yourTurn
        FROM games AS g
        JOIN gameSessions as gs ON g.gameToken = gs.gameToken
        WHERE gs.accessToken = ?`,
        [accessToken],
        (error, result, fields) => {
          if (error) throw error;
          resolve(result);
        }
      )
    });
  },

  deleteGame: (gameToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM games WHERE gameToken = ?`,
        [gameToken],
        (error, result, fields) => {
          if (error) throw error;
          resolve(result);
        }
      );
    })
  }
}