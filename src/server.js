// importamos las librerías requeridas
const path = require("path");
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
let data ={
  "Nombre": "camilo",
  "Apellido": "fuentes" 
}
const clients= new Map;
// Creamos el servidor de sockets y lo incorporamos al servidor de la aplicación
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

// Especificamos el puerto en una varibale port, incorporamos cors, express 
// y la ruta a los archivo estáticos (la carpeta public)
app.set("port", 3000);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

function originIsAllowed(origin) {
  // Para evitar cualquier conexión no permitida, validamos que 
  // provenga de el cliente adecuado, en este caso del mismo servidor.
  if (origin === "http://localhost:3000") {
    return true;
  }
  return false;
}

// Cuando llega un request por sockets validamos el origen
// En caso de origen permitido, recibimos el mensaje y lo mandamos
// de regreso al cliente
wsServer.on("request", (request) => {
  /* if (!originIsAllowed(request.origin)) {
    // Sólo se aceptan request de origenes permitidos
    request.reject();
    console.log((new Date()) + ' Conexión del origen ' + request.origin + ' rechazada.');
    return;
  } */
  const connection = request.accept(null, request.origin);
  console.log(request.key)
  clients.set(request.key,connection)
  connection.on("message", (message) => {
    console.log("Mensaje recibido: " + message.utf8Data);
    data= JSON.parse(message.utf8Data);
    clients.forEach((con,key)=>{
if(key!=request.key){
  con.sendUTF(JSON.stringify(data));
}

    })

  });
  connection.on("close", (reasonCode, description) => {
    console.log("El cliente se desconecto");
    clients.delete(request.origin)
  });
});


// Iniciamos el servidor en el puerto establecido por la variable port (3000)
server.listen(app.get('port'), () => {
  console.log('Servidor iniciado en el puerto: ' + app.get('port'));
})
