// Create websocket connection
var Websocket = io();

// Configure Date-time Picker
// Code referenced from: https://eonasdan.github.io/bootstrap-datetimepicker/
$(function () {
       $('#datetimepicker1').datetimepicker();
       $('#datetimepicker2').datetimepicker({
           useCurrent: false
       });
       $("#datetimepicker1").on("dp.change", function (e) {
           $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
       });
       $("#datetimepicker2").on("dp.change", function (e) {
           $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
       });
   });

   // ---===Helper functions===---
   var getType = function(element){
      return ({}).toString.call(element).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
   };
   // Validate date values
   function isValidDate(date){
     if(getType(date) !== "date") return false;
     return !isNaN(date.getTime());
   }


// Query button
// Data request via websocket
$('#TrialButton').click(function(){
  var date1 = $("#datetimepicker1").data();
  date1 = new Date(date1.date);
  var date2 = $("#datetimepicker2").data();
  date2 = new Date(date2.date);
  if(isValidDate(date1) === false || isValidDate(date2) ===false){
    window.alert("Invalid date-range selected. Ensure both date ranges are logical");
  } else {
    $('#TrialButton').get(0).lastChild.nodeValue = " Loading...";
    $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
    // TODO Add Websocket Emits here
  }
});
