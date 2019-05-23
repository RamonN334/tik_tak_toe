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
        (error, result, fields) => {
          if (error) throw error;
          resolve(result[0]);
        }
      );
    });
  },

  getPlayer: (accessToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM gameSessions WHERE accessToken = ?`,
        [accessToken],
        (error, result, fields) => {
          if (error) throw error;
          resolve(result[0]);
        }
      );
    });
  },

  joinToGameAsPlayer: (gameToken, userName, accessToken) => {
    connection.query(
      `UPDATE games SET opponent = ?, lastUpdate = ?, state = "playing" WHERE gameToken = ?`, 
      [userName, new Date(), gameToken], 
      (error, results, fields) => {
        if (error) throw error;
        console.log(results.affectedRows);
      }
    );

    module.exports.insertIntoGameSessions({
      'accessToken': accessToken,
      'gameToken': gameToken,
      'userName': userName,
      'yourSign': '0'
    });
  },

  joinToGameAsObserver: (gameToken, userName, accessToken) => {
    module.exports.insertIntoGameSessions({
      'accessToken': accessToken,
      'gameToken': gameToken,
      'userName': userName,
      'yourSign': '0',
      'gameRole': 'Observer'
    });
  },

  getGameState: (accessToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT g.owner, g.opponent, g.gameStart, g.gameResult, g.state, g.field, gs.yourTurn
        FROM games AS g
        JOIN gameSessions as gs ON g.gameToken = gs.gameToken
        WHERE gs.accessToken = ?`,
        [accessToken],
        (error, result, fields) => {
          if (error) throw error;
          resolve(result[0]);
        }
      )
    });
  },

  getGameByGameToken: (gameToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM games
        WHERE gameToken = ?`,
        [gameToken],
        (error, result, fields) => {
          if (error) throw error;
          resolve(result[0]);
        }
      )
    });
  },

  deleteGameByGameToken: (gameToken) => {
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
  },

  deleteNotActiveGames: (gameTokens) => {
      let query = connection.query(
        'DELETE FROM games WHERE gameToken IN (?)',
        [gameTokens],
        (error, results, fields) => {
          if (error) throw error;
          console.log(`Deleted ${results.affectedRows} rows`);
        }
      );

      console.log(query.sql);
  },

  updateGameSession: (accessToken, data) => {
    connection.query(
      `UPDATE gameSessions SET ? WHERE accessToken = ?`
    ),
    [data, accessToken],
    (error, result, fields) => {
      if (error) throw error;
    }
  },

  switchActivePlayer: (activePlayerAccessToken, gameToken) => {
    connection.query(
      `UPDATE gameSessions SET yourTurn = 0 WHERE accessToken = ? AND gameRole = "Player"`,
      [activePlayerAccessToken],
      (error, result, fields) => {
        if (error) throw error.sql;
      }
    );

    connection.query(
      `UPDATE gameSessions SET yourTurn = 1 WHERE gameToken = ? AND accessToken <> ? AND gameRole = "Player"`,
      [gameToken, activePlayerAccessToken],
      (error, result, fields) => {
        if (error) throw error.sql;
      }
    );
  },

  updateGameData: (gameToken, data) => {
    connection.query(
      `UPDATE games SET ? WHERE gameToken = ?`,
      [data, gameToken],
      (error, result, fields) => {
        if (error) throw error;
      }
    )
  },
}