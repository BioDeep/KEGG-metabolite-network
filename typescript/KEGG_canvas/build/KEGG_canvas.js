var convexHullImpl;
(function (convexHullImpl) {
    var convexHullTurns;
    (function (convexHullTurns) {
        convexHullTurns[convexHullTurns["left"] = 1] = "left";
        convexHullTurns[convexHullTurns["right"] = -1] = "right";
        convexHullTurns[convexHullTurns["none"] = 0] = "none";
    })(convexHullTurns || (convexHullTurns = {}));
    function JarvisMatch(points) {
        var hull = [];
        points.forEach(function (p) {
            if (hull.length === 0) {
                hull.push(p);
            }
            else {
                if (hull[0].x > p.x) {
                    hull[0] = p;
                }
                else if (hull[0].x == p.x) {
                    if (hull[0].y > p.y) {
                        hull[0] = p;
                    }
                }
            }
        });
        var q = null;
        var counter = 0;
        while (counter < hull.length) {
            q = nextHullPoint(points, hull[counter]);
            if (!q.Equals(hull[0])) {
                hull.push(q);
            }
            counter += 1;
        }
        return hull;
    }
    convexHullImpl.JarvisMatch = JarvisMatch;
    function nextHullPoint(points, p) {
        var q = p;
        var t = 0;
        points.forEach(function (r) {
            t = turn(p, q, r);
            if (t == convexHullTurns.right || t == convexHullTurns.none && p.dist(r) > p.dist(q)) {
                q = r;
            }
        });
        return q;
    }
    function turn(p, q, r) {
        var a = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
        var b = 0;
        if (a == b) {
            return convexHullTurns.none;
        }
        else if (a < b) {
            return convexHullTurns.right;
        }
        else {
            return convexHullTurns.left;
        }
    }
})(convexHullImpl || (convexHullImpl = {}));
var canvasModels;
(function (canvasModels) {
    /**
     * 2D point
    */
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * Calculate the 2d distance to other point from this point.
        */
        Point.prototype.dist = function (p2) {
            var dx = p2.x - this.x;
            var dy = p2.y - this.y;
            return dx * dx + dy * dy;
        };
        /**
         * Is this point equals to a given point by numeric value equals
         * of the ``x`` and ``y``?
        */
        Point.prototype.Equals = function (p2) {
            return this.x == p2.x && this.y == p2.y;
        };
        Point.prototype.toString = function () {
            return "[" + this.x + ", " + this.y + "]";
        };
        return Point;
    }());
    canvasModels.Point = Point;
    var Size = /** @class */ (function () {
        function Size() {
        }
        Size.prototype.toString = function () {
            return "[" + this.width + ", " + this.height + "]";
        };
        return Size;
    }());
    canvasModels.Size = Size;
})(canvasModels || (canvasModels = {}));
/**
 * Utils code that related to the html canvas node.
*/
var canvasUtils = /** @class */ (function () {
    function canvasUtils() {
    }
    /**
     * Serialize the svg node content to base64 string text value.
     *
     * @param id The ``svg`` node id attribute value.
    */
    canvasUtils.svg2base64 = function (id) {
        var svg = document.getElementById(id);
        var s = new XMLSerializer().serializeToString(svg);
        var encodedData = window.btoa(s);
        return "data:image/svg+xml;base64," + encodedData;
    };
    /**
     * Convert the svg image to png image and then do image file download.
     *
     * @param svgID The svg node ``id`` attribute value.
     * @param canvas_id The ``canvas`` node ``id`` attribute value.
     * @param fileName The file name for save the generated png image file.
    */
    canvasUtils.svg2png = function (svgID, canvas_id, fileName) {
        if (fileName === void 0) { fileName = "fallback.png"; }
        var canvas = document.querySelector(canvas_id);
        var context = canvas.getContext("2d");
        var image = new Image();
        image.src = canvasUtils.svg2base64(svgID);
        image.onload = function () {
            context.drawImage(image, 0, 0);
            var a = document.createElement("a");
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
    };
    return canvasUtils;
}());
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
var KEGG_canvas = /** @class */ (function () {
    function KEGG_canvas() {
        this.size = {
            width: 1000,
            height: 800
        };
        this.nodeMin = 5;
        this.names = {};
        this.nodecolor = {};
        this.loading_gif = new Image();
        this.type_groups = {};
        this.type_colors = {};
        this.baseURL = location.pathname;
        this.loading_gif_small = new Image();
        /**
         * Create tooltip element
        */
        this.tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "large-3 columns")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("opacity", 0);
        /**
         * 因为目前d3.js还不能够通过调整z-index来调整图层
         * 所以在这里先构建一个最开始图层，来避免polygon将网络的节点遮盖住，从而导致无法操作节点
         *
        */
        this.polygon_layer = null;
        this.toggles = [];
        this.loading_gif.src = "./img/ajax-loader.gif";
        this.loading_gif_small.src = "./img/small-loader.gif";
    }
    /**
     * 可以在后台按照类型为节点生成颜色
     */
    KEGG_canvas.prototype.colorNodes = function () {
        // set colors
        this.svg.selectAll("circle")
            .style("fill", function (d) {
            return d.Data.color;
        });
    };
    KEGG_canvas.prototype.displayTooltip = function (node) {
        var pos = d3.mouse(this);
        var html = "<span id='name'>" + node.name + "</span>";
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
    };
    KEGG_canvas.prototype.moveTooltip = function (node) {
        var pos = d3.mouse(this);
        this.tooltip
            .style("top", (d3.event.pageY + 10) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
    };
    KEGG_canvas.prototype.removeTooltip = function (node) {
        this.tooltip
            .style("z-index", -1)
            .style("opacity", 0); // Make tooltip invisible
        this.svg.selectAll("circle")
            .transition()
            .style("opacity", 0.8);
    };
    KEGG_canvas.prototype.displayPreview = function (e, preview) {
        var pos = [e.pageX, e.pageY + 20];
        this.tooltip.html(preview.innerHTML)
            .style("top", (pos[1]) + "px")
            .style("left", (pos[0]) + "px")
            .style("z-index", 10)
            .style("opacity", .9);
    };
    KEGG_canvas.prototype.setupGraph = function (graph) {
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
        });
        this.nodes = this.force.nodes();
        this.links = this.force.links();
        this.nodes.forEach(function (d) {
            this.nodecolor[d.name] = d.name;
        });
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
            }
            else {
                return link.value;
            }
        })
            .attr("id", "network")
            .style("stroke-width", function (d) {
            var w = -Math.log(d.weight * 2);
            if (w < 0.5) {
                w = 0.5;
            }
            else if (w > 3) {
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
            .style("opacity", this., 0.8)
            .on("mouseover", this.displayTooltip)
            .on("mousemove", this.moveTooltip)
            .on("mouseout", this.removeTooltip)
            .attr("id", "network")
            .call(this.force.drag);
        var label = node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function (d) { return d.name; });
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
    };
    /**
     * 在svg上面添加legend的rectangle以及相应的标签文本
     * 颜色和标签文本都来自于type_colors字典
     */
    KEGG_canvas.prototype.showLegend = function () {
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
        var radius = 6;
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
            var color = this.type_colors[type]; // 方块的颜色
            var label = type; // 标签文本
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
                }
                else {
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
                }
                else {
                    // 不显示，变灰色
                    this.style.color = "gray";
                    legendShapes[type].style.fill = "gray";
                }
            });
        });
    };
    /**
     * 实时计算出凸包，并绘制出凸包的多边形
     *
     */
    KEGG_canvas.prototype.convexHull_update = function () {
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
            });
            polygon = typedPolygons;
            // 绘制多边形
            // console.log(polygon);
            polygons.push({ group: type, points: polygon });
        });
        // console.log(polygons);
        this.drawPolygons(polygons);
        this.adjustLayouts();
    };
    KEGG_canvas.prototype.adjustLayouts = function () {
        if (!this.svg) {
            return;
        }
        this.svg.selectAll("use")
            .data([" "])
            .enter()
            .append("use")
            .attr("xlink:href", "#network");
    };
    /**
     * 这个函数所绘制的多边形将网络之中的节点都遮住了
     * 鼠标点击操作都无法进行了。。。。。
     *
     * 可能的解决方法有两个：
     *
     * 1. 现在需要通过位置判断来进行模拟点击？？？？
     * 2. 将polygon多边形放在最下层
     */
    KEGG_canvas.prototype.drawPolygons = function (polygons) {
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
    };
    return KEGG_canvas;
}());
//# sourceMappingURL=KEGG_canvas.js.map