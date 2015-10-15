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

client.connect(7000, '192.168.43.192', function(){
  console.log('Connected to remote Server');

  // setInterval(function(){
  //   console.log('Streaming Data: ' + xData);
  //   xData = xData +1;
  //   if(genRandomNum(0,1) > 0.5){device = "~iPhone";}
  //   else{device = "~iPad"};
  //   client.write( device + "," + (genRandomNum(0,15)-genRandomNum(0,5)) + "," + (genRandomNum(0,15)-genRandomNum(0,5)) + "," +
  //               (1442404311.781545+xData).toString() + "," + genRandomNum(0,3) +
  //               "," + genRandomNum(0,3) + "," + genRandomNum(0,3));
  // },40);

  // Code for live simulation
  var device1 = "Kathy";
  var device2 = "Noel";
  var xIncrement = 0.1;
  var yIncrement = 0;
  var dev1_currX = -2;
  var dev1_currY = -2;
  var dev2_currX = -3;
  var dev2_currY = 10;
  var step = 0;
  setInterval(function(){
    xData += 1;
    if(step === 0){
      dev1_currX += xIncrement;
      dev1_currY += yIncrement;
      client.write( device1 + "," + dev1_currX + "," + dev1_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);
      if(dev1_currX >= 3){
        step = 1;
        xIncrement = 0;
        yIncrement = 0.08;
      }//if dev1_currX > 3
    }//if step === 0

    if(step === 1){
      dev1_currX += xIncrement;
      dev1_currY += yIncrement;
      dev2_currY -= 0.08;
      client.write( device1 + "," + dev1_currX + "," + dev1_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);

      setTimeout(function(){
        client.write( device2 + "," + dev2_currX + "," + dev2_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);
      },20);
      if(dev1_currY >= 6){
        step = 2;
        xIncrement = -0.1;
        yIncrement = 0;
      }//if dev1_currX > 3
    }//if step === 0

    if(step === 2){
      dev1_currX += xIncrement;
      dev1_currY += yIncrement;
      client.write( device1 + "," + dev1_currX + "," + dev1_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);
      if(dev1_currX <= -2){
        step = 3;
        xIncrement = 0;
        yIncrement = -0.1;
      }//if dev1_currX > 3
    }//if step === 0

    if(step === 3){
      dev1_currX += xIncrement;
      dev1_currY += yIncrement;
      dev2_currY += 0.1;
      client.write( device1 + "," + dev1_currX + "," + dev1_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);
      setTimeout(function(){
        client.write( device2 + "," + dev2_currX + "," + dev2_currY + "," +
                    (1442404311.781545+xData).toString() + "," + 1 + "," + 1 + "," + 1);
      },20);
      if(dev1_currY <= -2){
        step = 0;
        xIncrement = 0.1;
        yIncrement = 0;
      }//if dev1_currX > 3
    }//if step === 0
  },60);
});

client.on('data', function(data){
  console.log('Received: ' + data);
});

client.on('close', function() {
  console.log('Connection closed');
})
