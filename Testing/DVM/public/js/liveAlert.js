// var Alertsocket = io();
Websocket.on('httpServer_alert', function(msg){
  console.log("Alert");
  $('#areaAlertMessage').append('<div class="alert alert-danger alert-dismissable">');
  $('#areaAlertMessage').append('<i class="fa fa-info-circle"></i> <strong>Warning!</strong> Unauthorized area entry');
  $('#areaAlertMessage').append('</div>');
});
