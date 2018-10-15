/**
 * 模块进行代谢物网络的可视化操作
 * 
 * 网络的节点有两个属性可以用来表示两个维度的数据：半径大小以及颜色值，
 * 例如半径大小可以用来表示进行代谢物鉴定结果之中的二级质谱碎片的匹配度得分，
 * 而颜色则可以用来表示SSM碎片响应度的相似程度的计算得分
 * 
 * 对于网络之中的节点而言，黑色节点表示没有出现在当前的代谢物鉴定结果之中的，但是却可以通过代谢反应和某一个所鉴定的代谢物相连的
 * 黑色节点和彩色节点之间的边连接为虚线
 * 
 * 彩色节点表示在当前的代谢物鉴定结果之中出现的KEGG化合物，彩色节点之间使用黑色的实现进行相连接
 * 
 */
class KEGG_canvas {

    public size: canvasModels.Size = <canvasModels.Size>{
        width: 1000,
        height: 800
    };
    public nodeMin: number = 5;
    public force;
    public nodes;
    public links;
    public svg;
    public names = {};
    public nodecolor = {};
    public loading_gif = new Image();
    public type_groups = {};
    public type_colors = {};
    public baseURL: string = location.pathname
    public loading_gif_small = new Image();

    /**
     * Create tooltip element
    */
    public tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "large-3 columns")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("opacity", 0);

    public constructor() {
        this.loading_gif.src = "./img/ajax-loader.gif";
        this.loading_gif_small.src = "./img/small-loader.gif";
    }

    /**
     * 可以在后台按照类型为节点生成颜色
     */
    private colorNodes() {

        // set colors
        this.svg.selectAll("circle")
            .style("fill", function (d) {
                return d.Data.color;
            });
    }

    private displayTooltip(node) {
        var pos = d3.mouse(this);
        var html = "<span id='name'>" + node.name + "</span>"

        if (node.Data.KCF) {

            var base64 = node.Data.KCF;

            html += "<br />";
            html += "<img src='data:image/png;base64," + base64 + "' />";
        }

        // console.log(node);

        this.tooltip.html(html)
            .style("top", (pos[1]) + "px")
            .style("left", (pos[0]) + "px")
            .style("z-index", 10)
            .style("opacity", .9);
    }

    private moveTooltip(node) {
        var pos = d3.mouse(this);

        this.tooltip
            .style("top", (d3.event.pageY + 10) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
    }

    private removeTooltip(node) {
        this.tooltip
            .style("z-index", -1)
            .style("opacity", 0)    // Make tooltip invisible
        this.svg.selectAll("circle")
            .transition()
            .style("opacity", 0.8);
    }

    private displayPreview(e, preview) {
        var pos = [e.pageX, e.pageY + 20]

        this.tooltip.html(preview.innerHTML)
            .style("top", (pos[1]) + "px")
            .style("left", (pos[0]) + "px")
            .style("z-index", 10)
            .style("opacity", .9);
    }

    /**
     * 因为目前d3.js还不能够通过调整z-index来调整图层 
     * 所以在这里先构建一个最开始图层，来避免polygon将网络的节点遮盖住，从而导致无法操作节点
     *
    */
    public polygon_layer = null;

    public setupGraph(graph) {

        $(".network").empty();
        this.names = {};
        this.nodecolor = {};

        this.force = d3.layout.force()
            .charge(-300)
            .linkDistance(100)
            .size([this.size.width, this.size.height]);

        this.svg = d3.select("#chart")
            .append("svg:svg")
            .attr("id", "network-canvas")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .attr("class", "network");

        this.force
            .nodes(graph.nodes)
            .links(graph.edges);

        this.polygon_layer = svg
            .append('g')
            .attr("id", "polygon_canvas");

        this.type_groups = [];
        this.type_colors = graph.types;

        console.log(this.type_colors);

        Object.keys(graph.types).forEach(function (t) {
            this.type_groups[t.toString()] = [];
        })

        this.nodes = this.force.nodes()
        this.links = this.force.links();

        this.nodes.forEach(function (d) {
            this.nodecolor[d.name] = d.name;
        })

        // var link = svg.selectAll("line.link")
        // 	.data(graph.edges)
        // 	.enter()
        // 	.insert("svg:line", "circle.node")
        // 	.attr("class", "link")
        // 	.attr("id", "network")
        // 	.style("stroke-width", function(d) { 

        // 		var w = -Math.log10( d.weight * 2 ) ;

        // 		if (w < 1) {
        // 			w = 1;
        // 		} else if ( w > 6 ) {
        // 			w = 6;
        // 		}

        // 		return w; 
        // 	})
        // 	.style("stroke", "gray")
        // 	.style("opacity", 0.8);

        var link = this.svg.selectAll("line")
            .data(graph.edges)
            .enter()
            .insert("svg:line", "circle.node")
            .attr("class", function (link) {
                if (link.value == "dash") {
                    return "dashed";
                } else {
                    return link.value;
                }
            })
            .attr("id", "network")
            .style("stroke-width", function (d) {

                var w = -Math.log(d.weight * 2);

                if (w < 0.5) {
                    w = 0.5;
                } else if (w > 3) {
                    w = 3;
                }

                return w;
            })
            .style("stroke", "gray")
            .style("opacity", 0.8);

        graph.nodes.forEach(function (node) {
            var types = node.type.split("|");

            // 跳过空的字符串
            if (node.type.length > 0) {
                // console.log(types);		
                types.forEach(function (name) {
                    // name = name.split(" ")[0];
                    // console.log(name);
                    this.type_groups[name].push(node);
                });
            }
        });

        console.log(this.type_groups);

        var node = this.svg.selectAll("circle.node")
            .data(graph.nodes)
            .enter()
            .append("svg:circle")
            .attr("class", "node")
            .call(this.force.drag)
            .attr("r", function (d) {
                if (d.degree > 0) {
                    return this.nodeMin + Math.pow(d.degree, 2 / (2.7));
                }
                return this.nodeMin;
            })
            .style("opacity", this. 0.8)
            .on("mouseover", this.displayTooltip)
            .on("mousemove", this.moveTooltip)
            .on("mouseout", this.removeTooltip)
            .attr("id", "network")
            .call(this.force.drag)

        var label = node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function (d) { return d.name });

        this.colorNodes();
        this.showLegend();
        this.force.start();

        // console.log(type_groups);

        this.force.on("tick", function () {
            this.svg.selectAll("line")
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            this.svg.selectAll("circle.node")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });

            label.attr("x", function (d) {
                return d.x;
            })
                .attr("y", function (d) {
                    return d.y - 10;
                });
        });

        setInterval(this.convexHull_update, 8);
    }

    public toggles = [];

    /**
     * 在svg上面添加legend的rectangle以及相应的标签文本
     * 颜色和标签文本都来自于type_colors字典
     */
    private showLegend() {

        var dH = 20;
        var rW = 300, rH = (dH + 5) * (Object.keys(this.type_colors).length - 1);
        var top = 30, left = this.size.width - rW;
        var dW = 15;
        var legend = this.svg.append("g")
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

        Object.keys(this.type_colors).forEach(function (type) {

            var color = this.type_colors[type];   // 方块的颜色
            var label = type;   // 标签文本

            this.toggles[type] = true;

            top += dH;
            legend.append("rect")
                .attr("x", left)
                .attr("y", top - 13)
                .attr("width", dW)
                .attr("height", dW)
                .style("fill", function () {
                    legendShapes[type] = this;
                    return this.type_colors[type];
                })
                .on("click", function () {
                    this.toggles[type] = !this.toggles[type];

                    if (this.toggles[type]) {
                        // 显示，恢复黑色
                        this.style.fill = this.type_colors[type];
                    } else {
                        // 不显示，变灰色
                        this.style.fill = "gray";
                    }
                });

            legend.append("text")
                .attr("x", left + dW + 5)
                .attr("y", top)
                .style("font-size", "0.85em")
                // .tooltip(type)
                .text(type)
                .on("click", function () {
                    this.toggles[type] = !this.toggles[type];

                    if (this.toggles[type]) {
                        // 显示，恢复黑色
                        this.style.color = "black";
                        legendShapes[type].style.fill = this.type_colors[type];
                    } else {
                        // 不显示，变灰色
                        this.style.color = "gray";
                        legendShapes[type].style.fill = "gray";
                    }
                });
        });
    }

    /**
     * 实时计算出凸包，并绘制出凸包的多边形
     *
     */
    private convexHull_update() {

        var types = Object.keys(this.type_groups);
        var polygons = [];

        types.forEach(function (type) {

            var group = this.type_groups[type];
            var points = [];

            if (!this.toggles[type]) {
                return;
            }

            group.forEach(function (d) {
                points.push({ x: d.x, y: d.y });
            });

            // console.log(points);

            // 计算出凸包
            // 获取得到的是多边形的顶点坐标集合
            var polygon = convexHullImpl.JarvisMatch(points);
            var typedPolygons = [];

            polygon.forEach(function (d) {
                d = { x: d.x, y: d.y, group: type };
                typedPolygons.push(d);
            })
            polygon = typedPolygons;

            // 绘制多边形
            // console.log(polygon);
            polygons.push({ group: type, points: polygon });
        })

        // console.log(polygons);

        this.drawPolygons(polygons);
        this.adjustLayouts();
    }

    private adjustLayouts() {

        if (!this.svg) {
            return;
        }

        this.svg.selectAll("use")
            .data([" "])
            .enter()
            .append("use")
            .attr("xlink:href", "#network");
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
    private drawPolygons(polygons) {

        // console.log(polygons)

        d3.selectAll(".pl").remove();

        if (!this.polygon_layer) {
            return;
        }

        this.polygon_layer
            .selectAll("g")
            .data(polygons)
            .enter()
            .append("polygon")
            .attr("points", function (d) {
                // console.log(d);
                return d.points.map(function (d) {
                    return [d.x, d.y].join(",");
                }).join(" ");
            })
            .attr("type", function (d) { return d.group; })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("opacity", 0.25)
            .attr("id", "polygon")
            .classed("pl", true)
            .classed("polygon", true)
            .style("fill", function (d) {
                var color = this.type_colors[d.group];
                return color;
            })
            // .tooltip(function(d) {return d.group})
            .attr("z-index", 100);
    }
}