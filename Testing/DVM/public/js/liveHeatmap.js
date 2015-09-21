// Initilise Websock
  var Websocket = io();
  Websocket.on('httpServer_msg', function(msg){
    console.log(msg);
  });

// --==Helper Functions==--
  // Create Tooltip
  var tooltip = document.querySelector('.HeatTooltip');
  // update function
  function updateToolTip(x,y,value){
    var transform = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
    tooltip.style.MozTransform = transform; /* Firefox */
    tooltip.style.msTransform = transform; /* IE (9+) - note ms is lowercase */
    tooltip.style.OTransform = transform; /* Opera */
    tooltip.style.WebkitTransform = transform; /* Safari and Chrome */
    tooltip.style.transform = transform; /* One day, my pretty */
    tooltip.innerHTML = value
  }
// -----------------------

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
    updateToolTip(parseInt(heatCoords[0]),parseInt(heatCoords[1]),"DeviceID_1");
    tooltip.style.display = 'block';
    heatmap.addData({ x: parseInt(heatCoords[0]), y: parseInt(heatCoords[1]) , value: 1 });
  });

  heatmapContainer.onmousemove = heatmapContainer.ontouchmove = function(e) {
    // we need preventDefault for the touchmove
    e.preventDefault();
    var x = e.layerX;
    var y = e.layerY;
    updateToolTip(x,y,"DeviceID_1");
    tooltip.style.display = 'block';
    heatmap.addData({ x: x, y: y, value: 1 });
  };

  heatmapContainer.onmouseout = function(){
    tooltip.style.display = 'none';
  };

  heatmapContainer.onclick = function(e) {
    var x = e.layerX;
    var y = e.layerY;
    heatmap.addData({ x: x, y: y, value: 1 });
  };
