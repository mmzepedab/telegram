const TelegramBot = require('node-telegram-bot-api');

const token = '867634671:AAHy8Njtgsdy9b59r8m8gUbtp5T2qNtZ1jA';

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Servidor de Telegram\n');
});

server.listen(port, hostname, () => {
  console.log(`Servidor Corriendo en http://${hostname}:${port}/`);
});

// Crear un bot de Telegram
const bot = new TelegramBot(token, { polling: true });

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

bot.onText(/\/numero (.+)/, (msg, match) => {
  // 'msg' es el mensaje recibido desde telegram
  // 'match' Es la ejecución del parametro dentro de la expreseión regular

  const chatId = msg.chat.id;
  const resp = match[1]; // El parametro recibido "parametro"

  let persona = msg.from.first_name;

  if (resp == 75) {
    bot.sendMessage(chatId, `Adivinaste el numero ${persona} sos la mera pija.`);
  } else if (resp > 100 || resp < 1){
    bot.sendMessage(chatId, `No seas maje ${persona} una instruccion tenias que seguir...`);
  }else {
    // Regresar el parametro que se recibio despues de Echo
    bot.sendMessage(chatId, `No ${persona} ese no es el numero.`);
  }

});