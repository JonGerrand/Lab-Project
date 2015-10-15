// Tracking variables
var dev1Freq = 0;
var dev2Freq = 0;
var dev1CurrentStatus = 0;
var dev2CurrentStatus = 0;
var offLimitZone = 5; // Presence of a device within this zone will cause a
                      // warning
var offLimitDev1 = 0;
var offLimitDev2 = 0;
var currentZone = 0;

// ---===Helper functions===---
function pad ( val ) { return val > 9 ? val : "0" + val; }
// ----------------------------

// ---===Timer class===---
var deviceTimer = function(timerNum){
  this.Timer = {};
  this.startTimer = function(){
    var seconds = 0;
    this.timer = setInterval( function(){
        $("#seconds" + timerNum).html(pad(++seconds%60));
        $("#minutes" + timerNum).html(pad(parseInt(seconds/60,10)));
    }, 1000);
  }
  this.stopTimer = function(){
    clearInterval(this.timer);
  }
}
dev1Timer = new deviceTimer("1");
dev2Timer = new deviceTimer("2");
// -----------------------

// ---===Zone detection===---
var performZoneClassification = function(x,y){
  // var x_dim = 4;
  // var y_dim = 4;
  // All zones are parallelograms
  // var zone1 = {xMin:0, xMax:x_dim/2, yMin:0, yMax: y_dim/2};
  // var zone2 = {xMin:x_dim/2, xMax:x_dim, yMin:0, yMax: y_dim/2};
  // var zone3 = {xMin:0, xMax:x_dim/2, yMin:y_dim/2, yMax: y_dim};
  // var zone4 = {xMin:x_dim/2, xMax:x_dim, yMin:y_dim/2, yMax: y_dim};
  var zone5 = {xMin:0, xMax:5, yMin:0, yMax:5}
  // Assign data to zones
  // Zone 1 Classification
  //  if((x > zone1.xMin) && (x < zone1.xMax) &&
  //     (y > zone1.yMin) && (y < zone1.yMax)){
  //       return 1;
  //     }//If
  //   // Zone 2 Classification
  //   if((x > zone2.xMin) && (x < zone2.xMax) &&
  //      (y > zone2.yMin) && (y < zone2.yMax)){
  //        return 2;
  //      }//If
  //  // Zone 3 Classification
  //  if((x > zone3.xMin) && (x < zone3.xMax) &&
  //     (y > zone3.yMin) && (y < zone3.yMax)){
  //       return 3;
  //     }//If
  // // Zone 4 Classification
  // if((x > zone4.xMin) && (x < zone4.xMax) &&
  //    (y > zone4.yMin) && (y < zone4.yMax)){
  //      return 4;
  //    }//If
if((x > zone5.xMin) && (x < zone5.xMax) &&
   (y > zone5.yMin) && (y < zone5.yMax)){
     return 5;
   }//If
  return 0;
};//performZoneClassification
// ---------------------------

// Receive Streamed Data
Websocket.on('httpServer_stats',function(data){
  if(deviceNameArray[0] === data.ID){
    if($('#dev1Name').text() === 'N/A') {
      $('#dev1Name').text(data.ID);
    }
    currentZone = performZoneClassification(data.x, data.y);
    if(currentZone !== 0){
      if(dev1CurrentStatus === 0){
        $('#dev1Feq').text(++dev1Freq);
        dev1Timer.startTimer();
        dev1CurrentStatus = 1;
      }//dev1CurrentStatus
      // Trigger warning if restricted zone breach is detected
      if(currentZone === offLimitZone && offLimitDev1 === 0){
        alertSequence(data.ID + " has entered the Zone");
        offLimitDev1 = 1;
      }
    }//currentZone !== 0
    else{
      dev1Timer.stopTimer();
      dev1CurrentStatus = 0;
      offLimitDev1 = 0;
    }//data.areaStatus === 0
  }//stat1ID === data.ID

  if(deviceNameArray[1] === data.ID){
    if($('#dev2Name').text() === 'N/A') {
      $('#dev2Name').text(data.ID);
    }
    currentZone = performZoneClassification(data.x, data.y);
    if(currentZone !== 0){
      if(dev2CurrentStatus === 0){
        $('#dev2Feq').text(++dev2Freq);
        dev2Timer.startTimer();
        dev2CurrentStatus = 1;
      }//dev1CurrentStatus
      // Trigger warning if restricted zone breach is detected
      if(currentZone === offLimitZone && offLimitDev2 === 0){
        alertSequence(data.ID + " has entered the Zone");
        offLimitDev2 = 1;
      }//currentZone === offLimitZone
    }//currentZone !== 0
    else{
      dev2Timer.stopTimer();
      dev2CurrentStatus = 0;
      offLimitDev2 = 0;
    }//data.areaStatus === 0
  }//stat1ID === data.ID
});
