/// <reference path="../build/linq.d.ts"/>

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
*/
class KEGG_canvas {

    public size: Canvas.Size = <Canvas.Size>{
        width: 1000,
        height: 800
    };
    public nodeMin: number = 5;
    public force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;
    public nodes: Graph.node[];
    public links: Graph.edge[];
    public svg: d3.Selection<any>;
    public names = {};
    public nodecolor = {};
    /**
     * {type, graph.node[]}
    */
    public type_groups = {};
    public type_colors = {};
    public baseURL: string = location.pathname
    public edgeOpacity: number = 0.8;

    /**
     * Create tooltip element
    */
    public tooltip: d3.Selection<any>;

    public constructor(graph: Graph.Model) {
        this.setupGraph(graph);
        this.tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "large-3 columns")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("opacity", 0);
    }

    public attachSaveAsPng(aId: string, fileName: string = "network.png") {
        $ts(aId).onclick = function () {
            CanvasHelper.saveSvgAsPng.Encoder.saveSvgAsPng("#network-canvas", fileName);
        }
    }

    /**
     * 可以在后台按照类型为节点生成颜色
    */
    private colorNodes() {
        // set colors
        this.svg
            .selectAll("circle")
            .style("fill", d => d.Data.color);
    }

    private displayTooltip(svg, node: Graph.node) {
        var pos = d3.mouse(svg);
        var html = `<span id='name'>${node.name}</span>`;

        if (node.Data.KCF) {
            html += `<br /><img src='data:image/png;base64,${node.Data.KCF}' />`;
        }

        this.tooltip.html(html)
            .style("top", (pos[1]) + "px")
            .style("left", (pos[0]) + "px")
            .style("z-index", 10)
            .style("opacity", .9);
    }

    private moveTooltip() {
        console.log("move");

        this.tooltip
            .style("top", `${(<any>d3.event).pageY + 10}px`)
            .style("left", `${(<any>d3.event).pageX + 10}px`);
    }

    private removeTooltip() {
        console.log("remove");

        this.tooltip
            .style("z-index", -1)
            // Make tooltip invisible
            .style("opacity", 0)
        this.svg.selectAll("circle")
            .transition()
            .style("opacity", 0.8);
    }

    private displayPreview(e, preview: HTMLElement) {
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
    */
    public polygon_layer: d3.Selection<any> = null;

    private Clear() {
        $(".network").empty();

        this.names = {};
        this.nodecolor = {};
    }

    private setupGraph(graph: Graph.Model) {
        var viz: KEGG_canvas = this;

        this.Clear();
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

        this.polygon_layer = this.svg
            .append('g')
            .attr("id", "polygon_canvas");

        this.type_groups = [];
        this.type_colors = graph.types;

        Object.keys(graph.types).forEach(t => viz.type_groups[t] = []);

        this.nodes = <any>this.force.nodes()
        this.links = <any>this.force.links();

        this.nodes.forEach(function (d) {
            viz.nodecolor[d.name] = d.name;
        })

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

        graph.nodes
            .forEach(function (node) {
                var types: string[] = node.type.split("|");

                // 跳过空的字符串
                if (node.type.length > 0) {
                    types.forEach(function (name) {
                        viz.type_groups[name].push(node);
                    });
                }
            });

        console.log(this.type_groups);

        var node: d3.Selection<Graph.node> = this.svg
            .selectAll("circle.node")
            .data(graph.nodes)
            .enter()
            .append("svg:circle")
            .attr("class", "node")
            .call(this.force.drag)
            .attr("r", function (d) {
                if (d.degree > 0) {
                    return viz.nodeMin + Math.pow(d.degree, 2 / (2.7));
                } else {
                    return viz.nodeMin;
                }
            })
            .style("opacity", viz.edgeOpacity)
            .on("mouseover", function (d) {
                viz.displayTooltip(this, d);
            })
            .on("mousemove", function (d) {
                viz.moveTooltip();
            })
            .on("mouseout", function (d) {
                viz.removeTooltip();
            })
            .attr("id", "network")
            .call(this.force.drag)

        var label = node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(d => d.name);

        this.colorNodes();
        this.showLegend();
        this.force.start();

        this.force.on("tick", function () {
            viz.svg.selectAll("line")
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            viz.svg.selectAll("circle.node")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });

            label.attr("x", function (d) {
                return d.x;
            })
                .attr("y", function (d) {
                    return d.y - 10;
                });
        });

        setInterval(() => this.convexHull_update(this.type_groups), 8);
    }

    private toggles: object = {};

    /**
     * 在legend之中每一行文本之间的间隔高度值
    */
    public dh: number = 20;
    public dw: number = 15;
    /**
     * legend的外边框圆角矩形的radius
    */
    public legendBoxRadius: number = 6;

    /**
     * 在svg上面添加legend的rectangle以及相应的标签文本
     * 颜色和标签文本都来自于type_colors字典
     */
    private showLegend() {
        var rW = 300, rH = (this.dh + 5) * (Object.keys(this.type_colors).length - 1);
        var top = 30, left = this.size.width - rW;
        var legend: d3.Selection<any> =
            this.svg.append("g")
                .attr("class", "legend")
                .attr("x", left)
                .attr("y", top)
                .attr("height", rH)
                .attr("width", rW);

        legend.append("rect")
            .attr("x", left)
            .attr("y", top)
            .attr("rx", this.legendBoxRadius)
            .attr("ry", this.legendBoxRadius)
            .attr("height", rH)
            .attr("width", rW)
            .style("stroke", "gray")
            .style("stroke-width", 2)
            .style("border-radius", "2px")
            .style("fill", "white");

        var legendShapes = [];
        var geo = {
            left: left + 10,
            top: top + 3
        }

        Object.keys(this.type_colors)
            .forEach(type => legendShapes = this.drawSerialsLegend(type, legend, geo, legendShapes));
    }

    private drawSerialsLegend(
        type: string,
        legend: d3.Selection<any>,
        geo: {
            left: number,
            top: number
        },
        legendShapes: any[]): any[] {

        var viz: KEGG_canvas = this;

        this.toggles[type] = true;

        geo.top += this.dh;
        legend.append("rect")
            .attr("x", geo.left)
            .attr("y", geo.top - 13)
            .attr("width", this.dw)
            .attr("height", this.dw)
            .style("fill", function () {
                legendShapes[type] = this;
                return viz.type_colors[type];
            })
            .on("click", function () {
                viz.toggles[type] = !viz.toggles[type];

                if (viz.toggles[type]) {
                    // 显示，恢复黑色
                    this.style.fill = viz.type_colors[type];
                } else {
                    // 不显示，变灰色
                    this.style.fill = "gray";
                }
            });

        legend.append("text")
            .attr("x", geo.left + this.dw + 5)
            .attr("y", geo.top)
            .style("font-size", "0.85em")
            .text(type)
            .on("click", function () {
                viz.toggles[type] = !viz.toggles[type];

                if (viz.toggles[type]) {
                    // 显示，恢复黑色
                    this.style.color = "black";
                    legendShapes[type].style.fill = viz.type_colors[type];
                } else {
                    // 不显示，变灰色
                    this.style.color = "gray";
                    legendShapes[type].style.fill = "gray";
                }
            });

        return legendShapes;
    }

    /**
     * 实时计算出凸包，并绘制出凸包的多边形
    */
    private convexHull_update(type_groups: object) {
        var types = new IEnumerator<string>(Object.keys(type_groups));
        var viz: KEGG_canvas = this;
        var polygons = types.Select(type => {
            // 计算多边形
            return <ConvexHull.Polygon>{
                group: type,
                points: viz.calculatePolygon(type).ToArray()
            }
        });

        this.drawPolygons(polygons);
        this.adjustLayouts();
    }

    private calculatePolygon(type: string): IEnumerator<ConvexHull.TagPoint> {
        var group: Graph.node[] = this.type_groups[type];
        var points: Canvas.Point[] = [];

        if (!this.toggles[type]) {
            return new IEnumerator<ConvexHull.TagPoint>([]);
        } else {
            points = From(group)
                .Select(d => new Canvas.Point(d.x, d.y))
                .ToArray();
        }

        // 计算出凸包
        // 获取得到的是多边形的顶点坐标集合
        var polygon: Canvas.Point[] = ConvexHull.impl.JarvisMatch(points);
        var typedPolygons: IEnumerator<ConvexHull.TagPoint> =
            From(polygon).Select(d => <ConvexHull.TagPoint>{
                x: d.x,
                y: d.y,
                group: type
            });

        return typedPolygons;
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
    private drawPolygons(polygons: IEnumerator<ConvexHull.Polygon>) {
        var viz: KEGG_canvas = this;

        if (!this.polygon_layer) {
            return;
        } else {
            d3.selectAll(".pl").remove();
        }

        this.polygon_layer
            .selectAll("g")
            .data(polygons.ToArray())
            .enter()
            .append("polygon")
            .attr("points", d => d.points.map(p => [p.x, p.y].join(",")).join(" "))
            .attr("type", d => d.group)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("opacity", 0.25)
            .attr("id", "polygon")
            .classed("pl", true)
            .classed("polygon", true)
            .style("fill", d => <string>viz.type_colors[d.group])
            .attr("z-index", 100);
    }
}