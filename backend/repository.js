const mysql = require('mysql')
const config = require('config')
const connection = mysql.createConnection(config.dbConfig);

module.exports = {
  createGame: (data) => {
    connection.query(
      `INSERT INTO games SET ?`, 
      data, 
      (error, results, fields) => {
        if (error) throw error;
      }
    );
  },

  createGameSession: (data) => {
    connection.query(
      `INSERT INTO gameSessions SET ?`, 
      data, 
      (error, results, fields) => {
        if (error) throw error;
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

  getPlayer: (accessToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM gameSessions WHERE accessToken = ?`,
        [accessToken],
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
        }
      );
    });
  },

  joinToGameAsPlayer: (gameToken, userName, accessToken) => {
    module.exports.updateGameData(
      gameToken,
      {
        opponent: userName,
        lastUpdate: new Date(),
        state: 'playing'
      }
    );

    module.exports.createGameSession({
      'accessToken': accessToken,
      'gameToken': gameToken,
      'userName': userName,
      'yourSign': '0'
    });
  },

  joinToGameAsObserver: (gameToken, userName, accessToken) => {
    module.exports.createGameSession({
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
        `SELECT g.owner, g.opponent, g.gameStart, g.gameResult, g.state, g.winner, g.field, gs.yourTurn
        FROM games AS g
        JOIN gameSessions as gs ON g.gameToken = gs.gameToken
        WHERE gs.accessToken = ?`,
        [accessToken],
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
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
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
        }
      )
    });
  },

  updateGameData: (gameToken, data) => {
    connection.query(
      `UPDATE games SET ? WHERE gameToken = ?`,
      [data, gameToken],
      (error, results, fields) => {
        if (error) throw error;
      }
    )
  },

  updateGameSession: (accessToken, data) => {
    connection.query(
      `UPDATE gameSessions SET ? WHERE accessToken = ?`
    ),
    [data, accessToken],
    (error, results, fields) => {
      if (error) throw error;
    }
  },

  deleteGameByGameToken: (gameToken) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM games WHERE gameToken = ?`,
        [gameToken],
        (error, results, fields) => {
          if (error) throw error;
          resolve(results);
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
        }
      );
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

  clearDB: () => {
    connection.query('DELETE FROM games'), {}, (error, results, fields) => {
      if (error) throw error;
    };
    // connection.query('DELETE FROM gameSessions'), {}, (error, results, fields) => {
    //   if (error) throw error;
    // }
  }
}