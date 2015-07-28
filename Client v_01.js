var net = require('net');

// Code for writing from a multiple times
//var readline = require('readline');
// var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('Please enter your message: ');var client = new net.Socket();

client.setKeepAlive(true);

client.connect(4040, '192.168.43.172', function(){
  console.log('Connected to remote Server');
  client.write('This is a message');

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
