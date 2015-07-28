var net = require('net');

var client = new net.Socket();
client.setKeepAlive(true);

client.connect(4040, 'localhost', function(){
  console.log('Connected to remote Server');
  client.write('This is a message');
});

client.on('data', function(data){
  console.log('Received: ' + data);
});

client.on('close', function() {
  console.log('Connection closed');
})
