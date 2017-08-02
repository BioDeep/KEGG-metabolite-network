var width   = 1024,
    height  = 650,
    nodeMin = 5;
var force, nodes, links, svg;
var names       = {};
var nodecolor   = {};
var loading_gif = new Image();
var type_groups = {};
var type_colors = {};

loading_gif.src = "./img/ajax-loader.gif";

var baseURL           = location.pathname
var loading_gif_small = new Image();

loading_gif_small.src = "./img/small-loader.gif";

// Create tooltip element
var tooltip = d3.select("#chart")
	.append("div")
	.attr("class", "large-3 columns")
	.attr("id", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("opacity", 0);

/**
 * 可以在后台按照类型为节点生成颜色
 */
function colorNodes(){
	
	// set colors
	svg.selectAll("circle")
	   .style("fill", function(d) {
	       return d.Data.color;
	});
}

function displayTooltip(node){
	var pos = d3.mouse(this);

	tooltip.html("<span id='name'>"+node.name+"</span>")
		.style("top", (pos[1])+"px")
		.style("left",(pos[0])+"px")
		.style("z-index", 10)
		.style("opacity", .9);
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
		.style("opacity", 0)    // Make tooltip invisible
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
		.style("opacity", .9);
}

// 在这里配置数据源
var json = "graph.json";

// 程序从这里开始执行
$(document).ready(function(){
$.getJSON(json, setupGraph);
});

function setupGraph(graph) {
	
	$(".network").empty();
	names = {};
	nodecolor = {};

	force = d3.layout.force()
		.charge(-100)
		.linkDistance(20)
		.size([width, height]);
	
	svg = d3.select("#chart")
		.append("svg:svg")
		// .attr("viewBox", "0 0 " +height+ " "+width+"")
		// .attr("preserveAspectRatio", "xMinYMin meet")
		.attr("width", width)
		.attr("height", height)
		.attr("class","network");
	
	force
		.nodes(graph.nodes)
		.links(graph.edges);
	
	type_groups = [];
	type_colors = graph.types;
	
	Object.keys(graph.types).forEach(function(t) {
		type_groups[t.toString()] = [];
	})
	
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
		.attr("id", "network")
		.style("stroke-width", function(d) { 
		
			var w = -Math.log10( d.weight * 2 ) ;
			
			if (w < 1) {
				w = 1;
			} else if ( w > 6 ) {
				w = 6;
			}
		
			return w; 
		})
		.style("stroke", "gray")
		.style("opacity", 0.8);

	var node = svg.selectAll("circle.node")
		.data(graph.nodes)
		.enter()
		.append("svg:circle")
		.attr("class", "node")
		.call(force.drag)
		.attr("r", function(d){
			if(d.degree>0){
				return nodeMin + Math.pow(d.degree, 2/(2.7));
			}
			return nodeMin;
		})
		.attr("type_group", function(d) {
			type_groups[d.type.toString()].push(this);
			return d.type;
		})
		.style("opacity",0.8)
		.on("mouseover", displayTooltip)
		.on("mousemove", moveTooltip)
		.on("mouseout", removeTooltip)
		.attr("id", "network")
		.call(force.drag)

	colorNodes();	
	force.start();
		
	// console.log(type_groups);
			
	force.on("tick", function () {
		svg.selectAll("line.link")
			.attr("x1", function (d) { return d.source.x; })
			.attr("y1", function (d) { return d.source.y; })
			.attr("x2", function (d) { return d.target.x; })
			.attr("y2", function (d) { return d.target.y; });
    	
		svg.selectAll("circle.node")
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function (d) { return d.y; });
			
		convexHull_update();
	});
}

/**
 * 实时计算出凸包，并绘制出凸包的多边形
 *
 */
function convexHull_update() {
	var types = Object.keys(type_groups);
	var polygons = [];
	
	types.forEach(function(type) {
		var group = type_groups[type];
		var points = [];
		
		group.forEach(function(d) {			
			points.push({x:d.cx.baseVal.value,y:d.cy.baseVal.value});
		});
		
		// console.log(points);
		
		// 计算出凸包
		// 获取得到的是多边形的顶点坐标集合
		var polygon = JarvisMatch(points);
		var typedPolygons = [];

		polygon.forEach(function(d) {
			d = {x:d.x,y:d.y,group:type};
			typedPolygons.push(d);
		})
		polygon = typedPolygons;
		
		// 绘制多边形
		// console.log(polygon);
		polygons[type] = polygon;
	})
	
	console.log(polygons);
	
	drawPolygons(polygons);
	adjustLayouts();
}

function adjustLayouts() {
	
	svg.selectAll("use")
	   .data([" "])
	   .enter()
	   .append("use")
       .attr("xlink:href","#network");
}

/**
 * 这个函数所绘制的多边形将网络之中的节点都遮住了
 * 鼠标点击操作都无法进行了。。。。。
 *
 * 可能的解决方法有两个：
 *
 * 1. 现在需要通过位置判断来进行模拟点击？？？？
 * 2. 将polygon多边形放在最下层
 */
function drawPolygons(polygons) {
	
	d3.select(".pl").remove();	
	svg.selectAll("polygon")
	   .data(polygons)
	   .enter().append("polygon")
	   .attr("points",function(d) { 
			// console.log(d);
			return d.map(function(d) {
				return [d.x,d.y].join(",");
			}).join(" ");
		})
	   .attr("stroke","black")
	   .attr("stroke-width",2)
	   .style("opacity",0.25)
	   .attr("id", "polygon")
	   .classed("pl", true)
	   .style("fill", function(d) {
			return type_colors[d.type];
	   })
	   .attr("z-index", -1000);
}