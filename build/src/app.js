"use strict";
var http = require('http');
var TelegramBot = require('node-telegram-bot-api');
var sqlite3 = require('sqlite3').verbose();
var token = '867634671:AAHy8Njtgsdy9b59r8m8gUbtp5T2qNtZ1jA';
var hostname = '127.0.0.1';
var port = 3000;
var db = new sqlite3.Database(':memory:');
var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Servidor de Telegram\n');
});
server.listen(port, hostname, function () {
    console.log("Servidor Corriendo en http://" + hostname + ":" + port + "/");
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('./db/telegram.db');
    var check;
    db.serialize(function () {
        db.run("DROP TABLE game;");
        db.run("CREATE TABLE if not exists game (\n      player1Id INTEGER, \n      player1Name TEXT, \n      player1Move INTEGER, \n      player2Id INTEGER, \n      player2Name TEXT, \n      player2Move INTEGER)");
        var stmt = db.prepare("INSERT INTO game (player1Id, player1Name, player1Move, player2Id, player2Name, player2Move) VALUES (1, 'Mario', 1, 2, 'Jose', 3)");
        stmt.run();
        /*
        for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
        }
        */
        stmt.finalize();
        db.each("SELECT rowid AS id, player1Id, player1Name, player1Move FROM game", function (err, row) {
            console.log(row.id + row.player1Id + row.player1Name + row.player1Move);
        });
    });
    db.close();
});
// Crear un bot de Telegram
var bot = new TelegramBot(token, { polling: true });
/*
// Igualar lo que haya en el parametro "/cafe [parametro]"
bot.onText(/\/cafe (.+)/, (msg, match) => {
    // 'msg' es el mensaje recibido desde telegram
    // 'match' Es la ejecución del parametro dentro de la expreseión regular

    const chatId = msg.chat.id;
    const resp = match[1]; // El parametro recibido "parametro"
  
    let persona = "El Potro";

    // Regresar el parametro que se recibio despues de Echo
    bot.sendMessage(chatId, `Hoy le toca el café a ${persona}`);
  });

  // Escucha cualquier mensaje y responde que lo recibió
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // Regresar un mensaje para confirmar que se recibió
    bot.sendMessage(chatId, 'Mensaje Recibido');
  });
  */
/*
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
*/
bot.onText(/\/numero (.+)/, function (msg, match) {
    // 'msg' es el mensaje recibido desde telegram
    // 'match' Es la ejecución del parametro dentro de la expreseión regular
    var chatId = msg.chat.id;
    var resp = match[1]; // El parametro recibido "parametro"
    var persona = msg.from.first_name;
    if (resp == 75) {
        bot.sendMessage(chatId, "Adivinaste el numero " + persona + " sos la mera pija.");
    }
    else if (resp > 100 || resp < 1) {
        bot.sendMessage(chatId, "No seas maje " + persona + " una instruccion tenias que seguir...");
    }
    else {
        // Regresar el parametro que se recibio despues de Echo
        bot.sendMessage(chatId, "No " + persona + " ese no es el numero.");
    }
});
