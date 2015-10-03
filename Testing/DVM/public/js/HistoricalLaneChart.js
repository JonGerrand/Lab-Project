// Create websocket connection
var Websocket = io();

// TODO Remove constants

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
   // Data is received in the form of a MapReduce Aggregation Result
   var performZoneClassification = function(data){
     var x_dim = 5;
     var y_dim = 5;
     var zonedArray = [];
     // All zones are parallelograms
     var zone1 = {xMin:0, xMax:x_dim/2, yMin:0, yMax: y_dim/2};
     var zone2 = {xMin:x_dim/2, xMax:x_dim, yMin:0, yMax: y_dim/2};
     var zone3 = {xMin:0, xMax:x_dim/2, yMin:y_dim/2, yMax: y_dim};
     var zone4 = {xMin:x_dim/2, xMax:x_dim, yMin:y_dim/2, yMax: y_dim};
     // Assign data to zones
     for (var i = 0; i < data.length; i++) {
       // Zone 1 Classification
       if((data[i].value.x > zone1.xMin) && (data[i].value.x < zone1.xMax) &&
          (data[i].value.y > zone1.yMin) && (data[i].value.y < zone1.yMax)){
            zonedArray.push({ID:data[i].value.id, date:data[i]._id,
                             zone:"Zone 1"});
          }//If
        // Zone 2 Classification
        if((data[i].value.x > zone2.xMin) && (data[i].value.x < zone2.xMax) &&
           (data[i].value.y > zone2.yMin) && (data[i].value.y < zone2.yMax)){
             zonedArray.push({ID:data[i].value.id, date:data[i]._id,
                              zone:"Zone 2"});
           }//If
       // Zone 3 Classification
       if((data[i].value.x > zone3.xMin) && (data[i].value.x < zone3.xMax) &&
          (data[i].value.y > zone3.yMin) && (data[i].value.y < zone3.yMax)){
            zonedArray.push({ID:data[i].value.id, date:data[i]._id,
                             zone:"Zone 3"});
          }//If
      // Zone 4 Classification
      if((data[i].value.x > zone4.xMin) && (data[i].value.x < zone4.xMax) &&
         (data[i].value.y > zone4.yMin) && (data[i].value.y < zone4.yMax)){
           zonedArray.push({ID:data[i].value.id, date:data[i]._id,
                            zone:"Zone 4"});
         }//If
     }//for
     return zonedArray
   };//performZoneClassification
   // Segment data into continuous lanes
   var laneDataFormation = function(zonedData){
     //  Initial variables
     var laneItems = [];
     var IDcounter = 0;
     // Dev1 variables
     var ID1 = 0;
     var name1 = "";
     var lane1 = "";
     var start1 = new Date();
     var end1 = new Date();
     var desc1 = "";
     var newLaneDev1 = false;
     var currentLaneDev1 = "";
     // Dev2 variables
     var ID2 = 0;
     var name2 = "";
     var lane2 = "";
     var start2 = new Date();
     var end2 = new Date();
     var desc2 = "";
     var newLaneDev2 = false;
     var currentLaneDev2 = "";
     // create lane items
     for (var i = 0; i < zonedData.length; i++) {
       if(zonedData[i].ID === "iPhone"){
         if(zonedData[i].zone !== currentLaneDev1){
           if(i === 0){
             // Format new entry
             name1 = zonedData[0].ID;
             lane1 = zonedData[0].zone;
             start1 = zonedData[0].date;
             IDcounter += 1;
             currentLaneDev1 = zonedData[0].zone;
           }else{
             // Insert old item
             end1 = zonedData[i-1].date;
             var stDate1 = new Date(start1);
             var endDate1 = new Date(end1);
             var tDiff1 = (endDate1 - stDate1)
             desc1 = "Time in reigion: " + parseFloat(Math.round(((tDiff1 % 86400000) % 3600000) / 60000)) +
                      "min, " + parseFloat(Math.round((((tDiff1 % 86400000) % 3600000) % 60000) / 1000))+"sec";
             laneItems.push({id:IDcounter, name:name1, lane:lane1, start:stDate1,
                             end:endDate1, desc:desc1, color:"#209802",
                             dev:"dev1"});
             // Format new entry
             ID1 = IDcounter;
             name1 = zonedData[i].ID;
             lane1 = zonedData[i].zone;
             start1 = zonedData[i].date;
             currentLaneDev1 = zonedData[i].zone;
             IDcounter += 1;
           }//else
         }//if zonedData[i].zone !== currentLaneDev1
       }//if iPhone
       if(zonedData[i].ID === "iPad"){
         if(i === 0){
           // Format new entry
           name2 = zonedData[0].ID;
           lane2 = zonedData[0].zone;
           start2 = zonedData[0].date;
           IDcounter += 1;
           currentLaneDev2 = zonedData[0].zone;
         }else{
           // Insert old item
           end2 = zonedData[i-1].date;
           var stDate2 = new Date(start2);
           var endDate2 = new Date(end2);
           var tDiff2 = (endDate2 - stDate2)
           desc2 = "Time in reigion: " + parseFloat(Math.round(((tDiff2 % 86400000) % 3600000) / 60000)) +
                    "min, " + parseFloat(Math.round((((tDiff2 % 86400000) % 3600000) % 60000) / 1000))+"sec";
           laneItems.push({id:IDcounter, name:name2, lane:lane2, start:stDate2,
                           end:endDate2, desc:desc2, color:"#000b9e",
                           dev:"dev2"});
           // Format new entry
           ID2 = IDcounter;
           name2 = zonedData[i].ID;
           lane2 = zonedData[i].zone;
           start2 = zonedData[i].date;
           currentLaneDev2 = zonedData[i].zone;
           IDcounter += 1;
         }//else
       }//if iPad
     }//for
     return laneItems;
   }//laneDataFormation
   // Parse data for insertion into Lane Chart
   var GenerateLaneData = function(chartdata) {

     var addToLane = function (chart, item) {
           var name = item.lane;

           if (!chart.lanes[name])
               chart.lanes[name] = [];
           var lane = chart.lanes[name];

           var sublane = 0;
           while(isOverlapping(item, lane[sublane]))
             sublane++;
           if (!lane[sublane]) {
             lane[sublane] = [];
         }
           lane[sublane].push(item);
       };

       var isOverlapping = function(item, lane) {
         if (lane) {
               for (var i = 0; i < lane.length; i++) {
                   var t = lane[i];
                   if (item.start < t.end && item.end > t.start) {
                       return true;
                   }
               }
         }
           return false;
       };

      var parseData = function (data) {
          var i = 0, length = data.length, node;
          chart = { lanes: {} };
          for (i; i < length; i++) {
              var item = data[i];
              addToLane(chart, item);
          }
          return collapseLanes(chart);
      };

      var collapseLanes = function (chart) {
       var lanes = [], items = [], laneId = 0;
       var now = new Date();
       for (var laneName in chart.lanes) {
         var lane = chart.lanes[laneName];
         for (var i = 0; i < lane.length; i++) {
           var subLane = lane[i];
           lanes.push({
             id: laneId,
             label: i === 0 ? laneName : ''
           });
           for (var j = 0; j < subLane.length; j++) {
             var item = subLane[j];
             items.push({
               id: item.id,
               name: item.name,
               lane: laneId,
               start: item.start,
               end: item.end,
               class: item.end > now ? 'future' : 'past',
               desc: item.desc,
               color:item.color
             });
           }
           laneId++;
         }
       }
       return {lanes: lanes, items: items};
      }

      //  return parseData(generateRandomWorkItems());
      var zones = performZoneClassification(chartdata);
      var laneItems = laneDataFormation(zones);
      return parseData(laneItems);
   };
   // return a variables data type
   var getType = function(element){
      return ({}).toString.call(element).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
   };
   // Validate date values
   function isValidDate(date){
     if(getType(date) !== "date") return false;
     return !isNaN(date.getTime());
   }
 // -------------------------------

// Query button
// Data request via websocket
$('#TrialButton').click(function(){
  var date1 = $("#datetimepicker1").data();
  date1 = new Date(date1.date);
  var date2 = $("#datetimepicker2").data();
  date2 = new Date(date2.date);
  if(isValidDate(date1) === false || isValidDate(date2) ===false){
    window.alert("Invalid date-range selected. Ensure both date ranges are logical.");
  } else {
    $('#TrialButton').get(0).lastChild.nodeValue = " Loading...";
    $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
    Websocket.emit('Temporal_query',{min: date1, max: date2});
  }
});

// Receive Temporal data from query
Websocket.on('httpServer_histOrd',function(histOrds){
  d3.select("svg").remove();
  createLaneChart(GenerateLaneData(histOrds));
  $('#TrialButton').get(0).lastChild.nodeValue = "Submit Date Range";
  $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
});
