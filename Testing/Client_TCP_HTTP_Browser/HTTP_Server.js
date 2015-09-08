var http = require('http').createServer(httpHandler);
var fs = require('fs');
var webSock = require('socket.io').listen(http);
var tcpSock = require('net');

var http_port = 8888;

var tcp_HOST = '192.168.43.63';
var tcp_PORT = 4040;

//Http Server Code
function httpHandler (req, res){
  fs.readFile(__dirname + '/index.html',
  function(err, data){
    if (err){
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

http.listen(http_port);
console.info("Http server listening on: " + http_port);

webSock.sockets.on('connection', function(socket){

  var tcpClient = new tcpSock.Socket();
  tcpClient.setEncoding("ascii");
  tcpClient.setKeepAlive(true);

  tcpClient.connect(tcp_PORT, tcp_HOST, function(){
    //Establish SINK status
    tcpClient.write("SINK");
    //Connection details
    console.info("HTTP Server connected to: " + tcp_HOST);

    //Data repetition
    tcpClient.on('data', function(data){
      console.log("Recieved Server Data: " + data);
      socket.emit("httpServer", data);
    });

    tcpClient.on('end', function(data){
      console.log("End data: " + data);
    });
  });

  socket.on('tcp-manager', function(message){
    console.log("tcp: " + message);
  });

  socket.emit("httpServer", "Initial Data");
});
