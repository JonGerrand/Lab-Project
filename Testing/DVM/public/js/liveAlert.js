// -=Function declarations=-

// Creates an Dismissable notification of varying types
var generateNotificationAlert = function(type, msg){
  if(type === 'Danger'){
    $('#areaAlertMessage')
    .append($('<div class="alert alert-danger alert-dismissable">')
    .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
    .append('<i class="fa fa-info-circle"></i> <strong>Danger!</strong>')
    .append(" " + msg));
  }
  if(type === 'Info'){
    $('#areaAlertMessage')
    .append($('<div class="alert alert-info alert-dismissable">')
    .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
    .append('<i class="fa fa-info-circle"></i> <strong>Info!</strong>')
    .append(" " + msg));
  }
  if(type === 'Warning'){
    $('#areaAlertMessage')
    .append($('<div class="alert alert-warning alert-dismissable">')
    .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
    .append('<i class="fa fa-info-circle"></i> <strong>Warning!</strong>')
    .append(" " + msg));
  }
  if(type === 'Success'){
    $('#areaAlertMessage')
    .append($('<div class="alert alert-success alert-dismissable">')
    .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
    .append('<i class="fa fa-info-circle"></i> <strong>Info!</strong>')
    .append(" " + msg));
  }
};

var setPanelAlert = function(toggle){
  if(toggle === "on"){
    $('#liveHeatmapPanel').attr('class','panel panel-red');
  }
  if(toggle === "off"){
    $('#liveHeatmapPanel').attr('class','panel panel-info');
  }
};

// Referenced from:
// http://stackoverflow.com/questions/18739888/playing-a-sound-in-a-browser-chrome-from-javascript
function playSound ( soundname ){
    var thissound = document.getElementById( soundname );
    thissound.play();
  }

// Function implementation
Websocket.on('httpServer_alert', function(msg){
  console.log("Alert");
  generateNotificationAlert('Success',msg);
  setPanelAlert("on");
  setTimeout(function(){setPanelAlert("off")},2000);
  playSound("AlertTone");
});
