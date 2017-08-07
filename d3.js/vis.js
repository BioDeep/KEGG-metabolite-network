var width   = 1000,
    height  = 800,
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
	var html = "<span id='name'>"+node.name+"</span>" 
	
	if (node.Data.KCF) {
		
		var base64 = node.Data.KCF;
		
		html += "<br />";
		html += "<img src='data:image/png;base64," + base64 + "' />";
	}
		
	// console.log(node);
	
	tooltip.html(html)
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

/**
 * 因为目前d3.js还不能够通过调整z-index来调整图层 
 * 所以在这里先构建一个最开始图层，来避免polygon将网络的节点遮盖住，从而导致无法操作节点
 *
 */
var polygon_layer = null;

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
	
	polygon_layer = svg
		.append('g')
		.attr("id", "polygon_canvas");
	
	type_groups = [];
	type_colors = graph.types;
	
	console.log(type_colors);
	
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

	graph.nodes.forEach(function(node) {
		var types = node.type.split("|");
		
		// 跳过空的字符串
		if (node.type.length > 0) {
			// console.log(types);		
			types.forEach(function(name) {
				// name = name.split(" ")[0];
				// console.log(name);
				type_groups[name].push(node);
			});
		}		
	});
		
	console.log(type_groups);
		
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
		/*
		.attr("type_group", function(d) {
			type_groups[d.type.toString()].push(this);
			return d.type;
		})
		*/
		.style("opacity",0.8)
		.on("mouseover", displayTooltip)
		.on("mousemove", moveTooltip)
		.on("mouseout", removeTooltip)
		.attr("id", "network")
		.call(force.drag)

	colorNodes();	
	showLegend();
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
			
		// convexHull_update();
	});
}

var toggles = [];

/**
 * 在svg上面添加legend的rectangle以及相应的标签文本
 * 颜色和标签文本都来自于type_colors字典
 */
function showLegend() {
	
	var dH = 20;
	var rW = 300, rH = (dH + 5) * (Object.keys(type_colors).length - 1); 
	var top = 30, left = width - rW;
	var dW = 15;
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("x", left)
		.attr("y", top)
		.attr("height", rH)		
		.attr("width", rW);

	// console.log(legend);
		
	// 外边框
	var radius = 6
	legend.append("rect")
		.attr("x", left)
		.attr("y", top)
		.attr("rx", radius)
		.attr("ry", radius)
		.attr("height", rH)
		.attr("width", rW)
		.style("stroke", "gray")
		.style("stroke-width", 2)
		.style("border-radius", "2px")
		.style("fill", "white");
		
	left += 10;
	top += 3;
		
	var legendShapes = [];
		
	Object.keys(type_colors).forEach(function(type) {
						
		var color = type_colors[type];   // 方块的颜色
		var label = type;   // 标签文本
				
		toggles[type] = true;
				
		top  += dH;
		legend.append("rect")
			.attr("x", left)
			.attr("y", top - 13)
			.attr("width", dW)
			.attr("height", dW)
			.style("fill", function() {				
				legendShapes[type] = this;
				return type_colors[type];
			})
			.on("click", function() {
				toggles[type] = !toggles[type];
				
				if (toggles[type]) {
					// 显示，恢复黑色
					this.style.fill=type_colors[type];
				} else {
					// 不显示，变灰色
					this.style.fill="gray";
				}
			});

		legend.append("text")
			.attr("x", left + dW + 5)
			.attr("y", top)
			.style("font-size", "0.85em")
			// .tooltip(type)
			.text(type)
			.on("click", function() {
				toggles[type] = !toggles[type];
				
				if (toggles[type]) {
					// 显示，恢复黑色
					this.style.color="black";
					legendShapes[type].style.fill=type_colors[type];
				} else {
					// 不显示，变灰色
					this.style.color="gray";
					legendShapes[type].style.fill="gray";
				}
			});	  	
	});	
}

setInterval("convexHull_update()", 8);

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
		
		if (!toggles[type]) {
			return;
		}
		
		group.forEach(function(d) {			
			points.push({x:d.x,y:d.y});
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
		polygons.push({group:type, points:polygon});
	})
	
	// console.log(polygons);
	
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
	
	// console.log(polygons)
	
	d3.selectAll(".pl").remove();	
		
	//polygons.forEach(function(poly) {
		// console.log(poly);
		
	polygon_layer
	   .selectAll("g")
	   .data(polygons)
	   .enter()
	   .append("polygon")
	   .attr("points",function(d) { 
			// console.log(d);
			return d.points.map(function(d) {
				return [d.x, d.y].join(",");
			}).join(" ");
		})
	   .attr("type", function(d) {return d.group;})
	   .attr("stroke","black")
	   .attr("stroke-width",2)
	   .style("opacity",0.25)
	   .attr("id", "polygon")
	   .classed("pl", true)
	   .classed("polygon", true)
	   .style("fill", function(d) {
			var color = type_colors[d.group];				
			return color;
	   })
	   .tooltip(function(d) {return d.group})
	   .attr("z-index", 100);		
	//})
}