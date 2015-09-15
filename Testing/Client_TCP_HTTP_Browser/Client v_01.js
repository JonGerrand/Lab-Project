var net = require('net');

// Code for writing from a multiple times
// var readline = require('readline');
// var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('Please enter your message: ');var client = new net.Socket();
var client = new net.Socket();
client.setKeepAlive(true);
var xData = 0;

client.connect(4040, '192.168.1.3', function(){
  console.log('Connected to remote Server');
  client.write('This is a message');

  // TODO There will have to be a throttling mechanism in place for the HTTP
  //  server for when the data rate received from the network is less than 190ms
  setInterval(function(){
    console.log('Streaming Data');
    xData = xData +1;
    client.write(xData.toString());
  },100);

  // rl.prompt();
  // rl.on('line', function(line){
  //   if (line === "close") rl.close();
  //   client.write(line);
  //   rl.prompt();
  // }).on('close', function(){
  //   process.exit(0);
  // })

});

client.on('data', function(data){
  console.log('Received: ' + data);
});

client.on('close', function() {
  console.log('Connection closed');
})
