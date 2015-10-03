var net = require('net');

// Code for writing from a multiple times
// var readline = require('readline');
// var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('Please enter your message: ');var client = new net.Socket();
var client = new net.Socket();
client.setKeepAlive(true);
var xData = 0;
var device = "";
var genRandomNum = function(min,max){
  return (Math.random() * max) + min;
}

var sendArray = "DeviceOne," + genRandomNum(1,500) + "," + genRandomNum(1,500) + ",1442404311.781545";
console.log(sendArray);

client.connect(7000, '192.168.1.11', function(){
  console.log('Connected to remote Server');

  setInterval(function(){
    console.log('Streaming Data: ' + xData);
    xData = xData +1;
    if(genRandomNum(0,1) > 0.5){device = "iPhone";}
    else{device = "iPad"};
    client.write( device + "," + (genRandomNum(0,5)-genRandomNum(0,0)) + "," + (genRandomNum(0,5)-genRandomNum(0,0)) + "," +
                (1442404311.781545+xData).toString() + "," + genRandomNum(0,3) +
                "," + genRandomNum(0,3) + "," + genRandomNum(0,3));
  },50);

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
