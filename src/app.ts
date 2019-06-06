
import { Game } from "../models/game.model"
import { exists } from "fs";

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
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Servidor de Telegram\n');
});

server.listen(port, hostname, () => {
  console.log(`Servidor Corriendo en http://${hostname}:${port}/`);

  var check;
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
      if(row){
        bot.sendMessage(chatId, `Se ha creado un nuevo juego`);
      }else{
        bot.sendMessage(chatId, `No se ha podido crear un nuevo juego`);
      }
    });
  });

}



bot.onText(/\/ppc/, async (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular

  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"

  let persona = msg.from.first_name;

  console.log(await gameExists(resp));
  if (await gameExists(resp)) {
    bot.sendMessage(chatId, `Ya existe un juego`);
  } else { // if juego existe
    console.log(`Se ha creado un nuevo juego para el chat: ${chatId}`);
    createGame(chatId, msg.from.id, msg.from.first_name)
  } // else Juego no existe

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

bot.onText(/\/end/, async (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular

  endGame(msg.chat.id);

});


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
