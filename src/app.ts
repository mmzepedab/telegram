
import { Game } from "../models/game.model"
//import { exists } from "fs";

const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

const token = '867634671:AAHy8Njtgsdy9b59r8m8gUbtp5T2qNtZ1jA';
const hostname = '127.0.0.1';
const port = 3000;

//let db = new sqlite3.Database(':memory:');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/telegram.db');

// Crear un bot de Telegram
const bot = new TelegramBot(token, { polling: true });

enum GameStatus {
  Started = 1,
  WaitingPlayer2 = 2,
  Completed = 10
}

enum Moves {
  Piedra = "piedra",
  Papel = "papel",
  Tijera = "tijera"
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Servidor de Telegram\n');
});

server.listen(port, hostname, () => {
  console.log(`Servidor Corriendo en http://${hostname}:${port}/`);
  console.log(`Creating Database`)
  var stmt = `CREATE TABLE if not exists game (
    chatId INTEGER,
  player1Id INTEGER, 
  player1Name TEXT, 
  player1Move INTEGER, 
  player2Id INTEGER, 
  player2Name TEXT, 
  player2Move INTEGER,
  status INTEGER)`;
  console.log(stmt);
  db.runAsync(stmt).then(() => {
    console.log(`Base de datos Creada Correctamente`)
  }).catch((err) => {
    console.log(JSON.stringify(err));
  });

  /*
  db.serialize(function () {

    //db.run(`DROP TABLE game;`);

    db.run(`CREATE TABLE if not exists game (
      player1Id INTEGER, 
      player1Name TEXT, 
      player1Move INTEGER, 
      player2Id INTEGER, 
      player2Name TEXT, 
      player2Move INTEGER,
      status INTEGER)`);

  });
  */

});


bot.onText(/\/ppc/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"
  let player1Id = msg.from.id;
  let player1Name = msg.from.first_name;
  var val;
  let getStmt = `SELECT * FROM game`

  db.getAsync(getStmt).then((row) => {
    if (!row) {
      console.log("No existe ninguna partida, creando una...");
      var insertSql = `INSERT INTO game 
      (chatId, player1Id, player1Name, player1Move, player2Id, player2Name, player2Move, status) 
      VALUES (${chatId}, ${player1Id}, '${player1Name}', 0, 0, '', 0, ${GameStatus.Started})`;
      console.log(insertSql);
      db.runAsync(insertSql).then(() => {
        console.log("Se ha creado la partida correctamente");
        bot.sendMessage(chatId, `Se ha creado la partida correctamente`);
        bot.sendMessage(chatId, `${player1Name} eres el jugador numero 1, enviar /player2 para unirse el jugador 2.`);
        askMove(msg.from.id, 1);
      });
    }
    else {
      console.log("Ya existe una partida");
      bot.sendMessage(chatId, `Ya existe un juego`);
    }
  }).then(() => {
    return val;
  }).catch((err) => {
    console.error(err);
  });



  /*
  console.log(await gameExists(resp));
  if (await gameExists(resp)) {
    bot.sendMessage(chatId, `Ya existe un juego`);
  } else { // if juego existe
    console.log(`Se ha creado un nuevo juego para el chat: ${chatId}`);
    createGame(chatId, msg.from.id, msg.from.first_name)
  } // else Juego no existe
  */
  /*
  if (resp == 75) {
    bot.sendMessage(chatId, `Adivinaste el numero ${persona} sos la mera pija.`);
  } else if (resp > 100 || resp < 1) {
    bot.sendMessage(chatId, `No seas maje ${persona} una instruccion tenias que seguir...`);
  } else {
    // Regresar el parametro que se recibio despues de Echo
    bot.sendMessage(chatId, `No ${persona} ese no es el numero.`);
  }*/

});

function askMove(fromId, player){
  console.log(`askMove`);
  console.log(`Haciendo Jugada para el jugador #${player} con el id: ${fromId}`);
  let getStmt = `SELECT * FROM game WHERE player1Id = ${fromId} OR player2Id = ${fromId}`

  /*
  db.getAsync(getStmt).then((row) => {
    if (row) {
      console.log("El juego no tiene jugador 2, agregandolo...");
      var updateSql = `UPDATE game SET player2Id = ${player2Id}, player2Name = "${player2Name}" WHERE player1Id != 0`;
      console.log(updateSql);
      db.runAsync(updateSql).then(() => {
        console.log("Se ha agregado el Jugador 2 a la partida correctamente");
        bot.sendMessage(chatId, `${player2Name} eres el jugador numero 2`);
      });
    }
    else {
      console.log(`El jugador ${fromId} no esta jugando en est partida`);
      bot.sendMessage(chatId, `La partida ya tiene jugador 2`);
    }
  });
  */


  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '\u{270A}',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: JSON.stringify({
              "move": `${Moves.Piedra}`,
              "player": player
            })
          },
          {
            text: '\u{270B}',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: JSON.stringify({
              "move": `${Moves.Papel}`,
              "player": player
            })
          },
          {
            text: '\u{270C}',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: JSON.stringify({
              "move": `${Moves.Tijera}`,
              "player": player
            })
          }
        ]
      ]
    }
  };
  bot.sendMessage(fromId, `Cual es tu movimiento jugador #${player}?`, opts);
}

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  console.log(callbackQuery);
  const action = JSON.parse(callbackQuery.data).move;
  console.log(`Accion: ${action}`);
  const player = JSON.parse(callbackQuery.data).player;
  console.log(`Player: ${player}`);
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;

  if (action === 'piedra') {
    text = 'Has seleccionado \u{270A}';
  }

  if (action === 'papel') {
    text = 'Has seleccionado \u{270B}';
  }

  if (action === 'tijera') {
    text = 'Has seleccionado \u{270C}';
  }

  bot.editMessageText(text, opts);
});



bot.onText(/\/end/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  const chatId = msg.chat.id;
  console.log("No existe ninguna partida, creando una...");
  var deleteSql = `DELETE FROM game`;
  console.log(deleteSql);
  db.runAsync(deleteSql).then(() => {
    console.log("Se han eliminado todas las partidas");
    bot.sendMessage(chatId, `Se ha eliminado la partida correctamente`);
  });

});

bot.onText(/\/player2/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"
  let player2Id = msg.from.id;
  let player2Name = msg.from.first_name;
  let getStmt = `SELECT * FROM game WHERE player2Id = 0`

  db.getAsync(getStmt).then((row) => {
    if (row) {
      console.log("El juego no tiene jugador 2, agregandolo...");
      var updateSql = `UPDATE game SET player2Id = ${player2Id}, player2Name = "${player2Name}" WHERE player1Id != 0`;
      console.log(updateSql);
      db.runAsync(updateSql).then(() => {
        console.log("Se ha agregado el Jugador 2 a la partida correctamente");
        bot.sendMessage(chatId, `${player2Name} eres el jugador numero 2`);
      });
    }
    else {
      console.log("La partida ya tiene jugador 2");
      bot.sendMessage(chatId, `La partida ya tiene jugador 2`);
    }
  });

});

bot.onText(/\/status/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"
  let player2Id = msg.from.id;
  let player2Name = msg.from.first_name;
  let getStmt = `SELECT chatId, player1Id, player1Name, player1Move, player2Id, player2Name, player2Move, status FROM game`
  console.log("Obteniendo status de juego:");
  console.log(getStmt);

  db.getAsync(getStmt).then((row) => {
    if (row) {
      console.log("Si existe partida");
      bot.sendMessage(chatId, 
        `
El estado de la partida es: ${row['status']}
El jugador 1 es: ${row['player1Name']}
El movimiento del jugador 1 es: ${row['player1Move']}  
El jugador 2 es: ${row['player2Name']}
El movimiento del jugador 1 es: ${row['player2Move']} 
`);

    }
    else {
      console.log("No Existe partida");
      bot.sendMessage(chatId, `No existe ninguna partida podes crear una con /ppc`);
    }
  });

});


// Igualar lo que haya en el parametro "/cafe [parametro]"
bot.onText(/\/numero (.+)/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  console.log("Mensaje recibido: " + match[1]);
  const numeroAdivinar = 37;

  const chatId = msg.chat.id;

  let persona = msg.from.first_name;
  const numeroRecibido = match[1]; // El parametro recibido "parametro"

  if (numeroRecibido == numeroAdivinar) {
    // Regresar el parametro que se recibio despues de Echo
    bot.sendMessage(chatId, `FELICIDADES ${persona} adivinaste el número, sos la mera pija!`);
  } else {
    if (Math.abs(numeroRecibido - numeroAdivinar) < 10) {
      bot.sendMessage(chatId, `Ese no es el número ${persona} pero andas caliente como el Potro!`);
    } else if (Math.abs(numeroRecibido - numeroAdivinar) > 20) {
      bot.sendMessage(chatId, `Ese no es el número ${persona} andas helado como el corazón de Demy!`);
    } else {
      bot.sendMessage(chatId, `Ese no es el número ${persona}`);
    }
  }


});

// Igualar lo que haya en el parametro "/cafe [parametro]"
bot.onText(/\/número (.+)/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular
  console.log("Mensaje recibido: " + match[1]);
  const numeroAdivinar = 37;

  const chatId = msg.chat.id;

  let persona = msg.from.first_name;
  const numeroRecibido = match[1]; // El parametro recibido "parametro"

  if (numeroRecibido == numeroAdivinar) {
    // Regresar el parametro que se recibio despues de Echo
    bot.sendMessage(chatId, `FELICIDADES ${persona} adivinaste el número, sos la mera pija!`);
  } else {
    if (Math.abs(numeroRecibido - numeroAdivinar) < 10) {
      bot.sendMessage(chatId, `Ese no es el número ${persona} pero andas caliente como el Potro!`);
    } else if (Math.abs(numeroRecibido - numeroAdivinar) > 20) {
      bot.sendMessage(chatId, `Ese no es el número ${persona} andas helado como el corazón de Demy!`);
    } else {
      bot.sendMessage(chatId, `Ese no es el número ${persona}`);
    }
  }


});

// Igualar lo que haya en el parametro "/cafe"
bot.onText(/\/cafe/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular

  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"

  let persona = "El señor Ministro";

  // Regresar el parametro que se recibio despues de Echo
  bot.sendMessage(chatId, `Hoy le toca el café a ${persona}`);
});
/*
function exists() {
  //let exists: any;
  let sql = `SELECT * FROM game WHERE status != ${GameStatus.Completed}`;
  db.runAsync(stmt).then(() => {
    return voteAsync("john doe");
  }).then((val) => {
    console.log(`New vote for John Doe is ${val}`);
  }).catch((err) => {
    console.log(JSON.stringify(err));
  });

  const exists = new Promise((resolve, reject) => {
    let sql = "SELECT status FROM game WHERE status = ? ";



    //db.get(sql, [GameStatus.WaitingPlayer2], (err, row) => {
    db.get(sql, [status], (err, row) => {
      if (err) {
        console.error(err.message);
        resolve(false);
      } else {
        if (row) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
  return exists;
}
*/

async function gameExists(status) {
  //let exists: any;
  const exists = await new Promise((resolve, reject) => {
    let sql = "SELECT status FROM game WHERE status = ? ";
    //db.get(sql, [GameStatus.WaitingPlayer2], (err, row) => {
    db.get(sql, [status], (err, row) => {
      if (err) {
        console.error(err.message);
        resolve(false);
      } else {
        if (row) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
  return exists;
}

function createGame(chatId, p1Id, p1Name) {
  console.log(`Creating Game`);

  db.serialize(function () {
    db.run(`CREATE TABLE if not exists game (
      chatId INTEGER,
    player1Id INTEGER, 
    player1Name TEXT, 
    player1Move INTEGER, 
    player2Id INTEGER, 
    player2Name TEXT, 
    player2Move INTEGER,
    status INTEGER)`);

    let stmt = db.prepare(
      `INSERT INTO game (chatId, player1Id, player1Name, player1Move, player2Id, player2Name, player2Move, status) 
    VALUES (${chatId}, ${p1Id}, '${p1Name}', 0, 0, '', 0, ${GameStatus.Started})`
    );
    console.log(stmt);
    stmt.run();
    stmt.finalize();

    db.each("SELECT rowid AS id, player1Id, player1Name, player1Move, status FROM game", function (err, row) {
      console.log(row.id + row.player1Id + row.player1Name + row.player1Move + row.status);
      if (row) {
        bot.sendMessage(chatId, `Se ha creado un nuevo juego`);
      } else {
        bot.sendMessage(chatId, `No se ha podido crear un nuevo juego`);
      }
    });
  });

}








async function endGame(chatId) {
  await db.run(`DROP TABLE game;`, [], ((err, rsp) => {
    if (err) {
      console.log("No se ha podido eliminar la tabla: " + err);
      bot.sendMessage(chatId, `No se ha podido eliminar la partida`);
    } else {
      console.log("Se ha eliminado la tabla correctamente." + rsp);
      bot.sendMessage(chatId, `Se ha terminado el juego`);
    }
  }));
}


// When the server is closed
server.on('close', () => {
  console.log('Connection terminated');
  bot.stopPolling();
  db.close((err, rsp) => {
    if (err) {
      console.log("No se ha podido cerrar la conexión a la base de datos error: " + err);
    } else {
      console.log("Conexión a la base de datos cerrada correctamente.");
    }

  });
});

process.on('SIGINT', function () {
  server.close();
});



//SQlite Async Calls

db.getAsync = function (sql) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.get(sql, function (err, row) {
      if (err)
        reject(err);
      else
        resolve(row);
    });
  });
};

db.allAsync = function (sql) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.all(sql, function (err, rows) {
      if (err)
        reject(err);
      else
        resolve(rows);
    });
  });
};

db.runAsync = function (sql) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.run(sql, function (err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  })
};
