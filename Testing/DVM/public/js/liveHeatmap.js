  // Initilise Websock
  var Websocket = io();

  // Scaling variables
  var x_pixle = $('#heatmapContainerWrapper').width();
  var y_pixel = $('#heatmapContainerWrapper').height();
  var ordContainer = {};
  // Device name declaration
  var deviceNameArray = ['',''];

// --==Helper Functions==--
  // Create Tooltip
  var tooltip1 = document.querySelector('.HeatTooltip1');
  var tooltip2 = document.querySelector('.HeatTooltip2');
  // update function
  function updateToolTip(x,y,value){
    var transform = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
    if(value === deviceNameArray[0]){
      tooltip1.style.MozTransform = transform; /* Firefox */
      tooltip1.style.msTransform = transform; /* IE (9+) - note ms is lowercase */
      tooltip1.style.OTransform = transform; /* Opera */
      tooltip1.style.WebkitTransform = transform; /* Safari and Chrome */
      tooltip1.style.transform = transform; /* One day, my pretty */
      tooltip1.innerHTML = value;
      tooltip1.style.display = 'block';
    }
    if(value === deviceNameArray[1]){
      tooltip2.style.MozTransform = transform; /* Firefox */
      tooltip2.style.msTransform = transform; /* IE (9+) - note ms is lowercase */
      tooltip2.style.OTransform = transform; /* Opera */
      tooltip2.style.WebkitTransform = transform; /* Safari and Chrome */
      tooltip2.style.transform = transform; /* One day, my pretty */
      tooltip2.innerHTML = value;
      tooltip2.style.display = 'block';
    }
  }
  // Scale received values
  function scaleOrds(x,y){
    var x_fixed = 5;
    var y_fixed = 5;
    var x_scaled = x/x_fixed;
    var y_scaled = y/y_fixed;
    var x_mapped = (x_scaled*x_pixle);
    var y_mapped = (y_scaled*y_pixel);
    return {x:x_mapped, y:y_mapped};
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
    for (var i = 0; i < deviceNameArray.length; i++) {
      if(($.inArray(ord.ID , deviceNameArray) === -1 ) && (deviceNameArray[i] === '')){
        deviceNameArray[i] = ord.ID;
      }
    }
    ordContainer = scaleOrds(ord.x,ord.y);
    updateToolTip(ordContainer.x, ordContainer.y, ord.ID);
    heatmap.addData({ x: ordContainer.x, y: ordContainer.y , value: 0.1 });
  });

  console.log($('#heatmapContainerWrapper').width());

  heatmapContainer.onmousemove = heatmapContainer.ontouchmove = function(e) {
    // we need preventDefault for the touchmove
    // e.preventDefault();
    var x = e.layerX;
    var y = e.layerY;
    updateToolTip(x,y,"iPad");
    heatmap.addData({ x: x, y: y, value: 0.1 });
  };

  heatmapContainer.onmouseout = function(){
    tooltip2.style.display = 'none';
  };
