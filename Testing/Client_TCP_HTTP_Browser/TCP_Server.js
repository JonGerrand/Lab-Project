var net = require('net');

var HOST = '192.168.1.100';
var PORT = 4040;

//Place a listening notification here
var TCPserver = net.createServer();
TCPserver.listen(PORT, HOST);
console.log("TCP Server Connected on: " + HOST + ":" + PORT);

conectionList = [];

TCPserver.on('connection', function(sock){
  console.log("Connected " + sock.remoteAddress);
  sock.write("TCP Server response");
  conectionList.push(sock);

  sock.on('data', function(data){
  	conectionList[0].write(data);
  });

}).listen(PORT, HOST);
