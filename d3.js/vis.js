var width = 1024,
    height = 800,
    nodeMin = 5;
var force, nodes, links, svg;
var names = {};
var nodecolor = {};
var discussion_url;
var loading_gif = new Image();

loading_gif.src = "./img/ajax-loader.gif";

var baseURL= location.pathname
var loading_gif_small = new Image();

loading_gif_small.src = "./img/small-loader.gif";


//Create tooltip element
var tooltip = d3.select("#chart")
.append("div")
.attr("class", "large-3 columns")
.attr("id", "tooltip")
.style("position", "absolute")
.style("z-index", "10")
.style("opacity", 0);

function colorNodes(){
	
	console.log("nodecolor values:");
	console.log(nodecolor);
	
  for(name in nodecolor){
    nodecolor[name]=d3.rgb(255*Math.random(), 255*Math.random(), 255*Math.random())
  }

  //set colors
  svg.selectAll("circle")
    .style("fill", function(d){
      // if (d.name === OP.name){
        // return "orange";
      // }
     // if (names[d.name]===1){
     //   return "black"
     // }
      //else{
        return nodecolor[d.name];
     //}
    }
    )
}


function displayTooltip(node){
  var pos = d3.mouse(this);

  tooltip.html( "<span id='name'>"+node.name+"</span>" )
    .style("top", (pos[1])+"px")
    .style("left",(pos[0])+"px")
    .style("z-index", 10)
    .style("opacity", .9)
}

function moveTooltip(node){
  var pos = d3.mouse(this);
  tooltip
    .style("top", (d3.event.pageY+10)+"px")
    .style("left",(d3.event.pageX+10)+"px");
}

function removeTooltip(node){
  tooltip
    .style("z-index",  -1)
    .style("opacity", 0)    //Make tooltip invisible
    svg.selectAll("circle")
    .transition()
    .style("opacity", 0.8);
}

function displayPreview(e, preview){
  var pos = [e.pageX, e.pageY+20]
    tooltip.html(preview.innerHTML)
    .style("top", (pos[1])+"px")
    .style("left",(pos[0])+"px")
    .style("z-index", 10)
    .style("opacity", .9)
}

// 程序从这里开始执行
$(document).ready(function(){
  
	$.getJSON( "graph.json", function( graph ) {
		
		 $(".network").empty();
  names = {};
  nodecolor = {};

  force = d3.layout.force()
    .charge(-100)
    .linkDistance(20)
    .size([width, height]);

	console.log(width);
	console.log(height);
	
	svg = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class","network");
	
	force.nodes(graph.nodes).links(graph.edges);
	
	nodes = force.nodes()
        links = force.links();
	
	 nodes.forEach(function(d) {
	
	 nodecolor[d.name] = d.name;
	
 })
		
		
		  var link = svg.selectAll("line.link")
    .data(graph.edges)
	.enter()
	.insert("svg:line", "circle.node")
    .attr("class", "link")
    .style("stroke-width", function(d) { 
		var w = -Math.log10( d.weight ) ;
		
		if (w < 1) {
			w =1;
		}
		
		return w; 
	})
    .style("stroke", "gray")
    .style("opacity",0.8);

  var node = svg.selectAll("circle.node")
    .data(graph.nodes)
	.enter()
	.append("svg:circle")
    .attr("class", "node")
    .call(force.drag)
    .attr("r", function(d){
      if(d.degree>0){
        return nodeMin + Math.pow(d.degree, 1/(2.7));
      }
      return nodeMin;
    })
  .style("opacity",0.8)
    .on("mouseover", displayTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", removeTooltip)
    .call(force.drag)

	 colorNodes();
	 
	 
	 console.log(force);
	
    force.start();
		
		
  force.on("tick", function () {
    svg.selectAll("line.link")
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });
    	
svg.selectAll("circle.node")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });
  });
		
	});
});

