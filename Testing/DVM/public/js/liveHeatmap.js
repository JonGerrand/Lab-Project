// window.onload = function() {

  var Websocket = io();
  Websocket.on('httpServer_msg', function(msg){
    console.log(msg);
  });

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

  heatmapContainer.onmousemove = heatmapContainer.ontouchmove = function(e) {
    // we need preventDefault for the touchmove
    e.preventDefault();
    var x = e.layerX;
    var y = e.layerY;
    if (e.touches) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    }

    heatmap.addData({ x: x, y: y, value: 1 });
  };

  heatmapContainer.onclick = function(e) {
    var x = e.layerX;
    var y = e.layerY;
    heatmap.addData({ x: x, y: y, value: 1 });
  };
// };
