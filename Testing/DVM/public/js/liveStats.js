// Device trackers
var stat1ID = "iPhone";
var stat2ID = "iPad";
// Tracking variables
var dev1Freq = 0;
var dev2Freq = 0;
var dev1CurrentStatus = 0;
var dev2CurrentStatus = 0;

// Helper functions
function pad ( val ) { return val > 9 ? val : "0" + val; }
// Timer class
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

Websocket.on('httpServer_stats',function(data){
  if(stat1ID === data.ID){
    if(data.areaStatus === 1){
      if(dev1CurrentStatus === 0){
        $('#dev1Feq').text(++dev1Freq);
        dev1Timer.startTimer();
        dev1CurrentStatus = 1;
      }//dev1CurrentStatus
    }//data.areaStatus === 1
    if(data.areaStatus === 0){
      dev1Timer.stopTimer();
      dev1CurrentStatus = 0;
    }//data.areaStatus === 0
  }//stat1ID === data.ID

  if(stat2ID === data.ID){
    if(data.areaStatus === 1){
      if(dev2CurrentStatus === 0){
        $('#dev2Feq').text(++dev2Freq);
        dev2Timer.startTimer();
        dev2CurrentStatus = 1;
      }//dev1CurrentStatus
    }//data.areaStatus === 1
    if(data.areaStatus === 0){
      dev2Timer.stopTimer();
      dev2CurrentStatus = 0;
    }//data.areaStatus === 0
  }//stat1ID === data.ID
});
