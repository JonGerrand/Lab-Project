// Create websocket connection
var Websocket = io();

$('#TrialButton').click(function(){
  Websocket.emit('histHeatmap_query',{min: new Date('09/15/2015'), max: new Date('09/17/2015')});
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

Websocket.on('httpServer_ord', function(ord){
  console.log('Received Co-ord:' + ord);
  var heatCoords = ord.split(",");
  heatmap.addData({ x: parseInt(heatCoords[0]), y: parseInt(heatCoords[1]) , value: 1 });
});

Websocket.on('httpServer_histOrd',function(histOrds){
  console.log(histOrds);
});

heatmapContainer.onclick = function(e) {
  // var x = e.layerX;
  // var y = e.layerY;
  // heatmap.addData({ x: x, y: y, value: 1 });
};
