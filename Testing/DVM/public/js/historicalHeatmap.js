// Create websocket connection
var Websocket = io();

$('#TrialButton').click(function(){
  Websocket.emit('histHeatmap_query',{min: new Date('09/15/2015'), max: new Date('09/19/2015')});
  // Websocket.emit('histHeatmap_query',{min: 0, max: 500});
});

// Historical data retrieval
// create a heatmap instance
var heatmap = h337.create({
  container: document.getElementById('heatmapContainer'),
  maxOpacity: .6,
  radius: 10,
  blur: .90,
  // backgroundColor with alpha so you can see through it
  backgroundColor: 'rgba(19, 122, 154, 0.12)'
});
var heatmapContainer = document.getElementById('heatmapContainerWrapper');

// Receive historic data from query
Websocket.on('httpServer_histOrd',function(histOrds){
  var histPoints = [];
  for (var i = 0; i < histOrds.length; i++) {
    // heatmap.addData({x:histOrds[i].value.x, y:histOrds[i].value.y, value:1});
    var point = {x:histOrds[i].value.x, y:histOrds[i].value.y, value:1};
    histPoints.push(point);
  }
  data = {max:1,data:histPoints};
  heatmap.setData(data);
});

heatmapContainer.onclick = function(e) {
  // var x = e.layerX;
  // var y = e.layerY;
  // heatmap.addData({ x: x, y: y, value: 1 });
};
