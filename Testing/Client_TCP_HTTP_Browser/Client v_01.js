var net = require('net');

// Code for writing from a multiple times
// var readline = require('readline');
// var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('Please enter your message: ');var client = new net.Socket();
var client = new net.Socket();
client.setKeepAlive(true);
var xData = 0;
var genRandomNum = function(min,max){
  return Math.floor(Math.random() * max) + min;
}

var sendArray = "TestDeviceOne," + genRandomNum(1,500) + "," + genRandomNum(1,500) + ",1442404311.781545";
console.log(sendArray);

client.connect(4040, '192.168.1.2', function(){
  console.log('Connected to remote Server');

  setInterval(function(){
    console.log('Streaming Data: ' + xData);
    xData = xData +1;
    client.write("TestDeviceOne," + genRandomNum(1,500) + "," + genRandomNum(1,500) + ",1442404311.781545");
  },30);

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
