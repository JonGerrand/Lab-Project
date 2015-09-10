//------------------------------------------------------------------------------
//  FILENAME: SARM_v_01.js
//  AUTHOR:   J.Gerrand 349361
//  COMMENTS: Fufills the role of the SARM within the Pedestrian System
// -----------------------------------------------------------------------------

//Load dependencies
var net = require('net');

//Set SARM Parameters
var HOST = '192.168.1.3';
var PORT = 4040;
sinkList = [];
var replicated = 0;

//----====Helper Functions====------

//----------------------------------

//Initilise the SARM and Set "Waiting" configuration
var TCPserver = net.createServer();
TCPserver.listen(PORT, HOST);
console.log("SARM waiting on: " + HOST + ":" + PORT);

//Main SARM Event Defenitions
TCPserver.on('connection', function(sock){

  //-==Connection Handling==-
  //Register connection
  console.log("Connected " + sock.remoteAddress);
  //Socket formatting
  sock.setEncoding("ascii");

  //-==I/O Handling==-
  sock.on('data', function(data){
    // Output data to Sinks
    if(data != "SINK"){
      for (var i = 0; i < sinkList.length; i++) {
        sinkList[i].write(data);
      }
    }
    // Agent type-definition
    if(data === "SINK"){
      var replicated = 0;
      // Verify new connection
      for (var i = 0; i < sinkList.length; i++) {
        if(sinkList[i].remoteAddress === sock.remoteAddress){
          replicated = 1;
        }
      }
      if(replicated != 1){
        //Confirm incoming connection
        sock.write("SARM CONNECTION ESTABLISHED");
        //Add to Sink list
        sinkList.push(sock);
      }
    } //Agent type-definition

    //TODO Aggregation functions

  }); //IO Handling

  //-==Error Handling==-
  sock.on('error', function(error){
    console.log("A Sink has been disconnected");
    sinkList.pop(); // This is simplified under the assumption that only 1 DVM module is connected at one time
  });//Error Handling

}).listen(PORT, HOST); //SARM event definitions
