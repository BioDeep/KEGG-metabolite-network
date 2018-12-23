var CloudCircle = /** @class */ (function () {
    function CloudCircle() {
    }
    return CloudCircle;
}());
/// <reference path="../build/linq.d.ts"/>
/// <reference path="../build/svg.d.ts"/>
var CloudVizPlot = /** @class */ (function () {
    function CloudVizPlot(margin) {
        if (margin === void 0) { margin = {
            top: 0,
            right: 50,
            bottom: 0,
            left: 0
        }; }
        this.svg = d3.select("svg");
        this.size = {
            width: parseFloat(this.svg.attr("width")) - margin.left - margin.right,
            height: parseFloat(this.svg.attr("height")) - margin.top - margin.bottom
        };
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        this.tip = this.createTooltip();
    }
    /**
     * 在这里构建出具体的tooltip行为
    */
    CloudVizPlot.prototype.createTooltip = function () {
        return d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return CloudVizPlot.tooltipHtml(d); });
    };
    CloudVizPlot.tooltipHtml = function (d) {
        var color = CloudVizPlot.Colors[d.size > 0 ? "+" : "-"];
        var DEM = "<tr>\n                      <td>DEM(m/z@rt):</td>\n                      <td>\n                        <strong>\n                            <span style='color:" + color.value + "'>\n                                " + d.mz.toFixed(2) + "@" + Math.abs(d.rt).toFixed(2) + "\n                            </span>\n                        </strong>\n                      </td>\n                   </tr>";
        var log2FC = "<tr>\n                         <td>log<sub>2</sub>FC:</td>\n                         <td>" + d.size.toFixed(2) + "</td>\n                      </tr>";
        var pvalue = "<tr>\n                         <td>p-value:</td>\n                         <td>" + Math.pow(10, -d.depth).toExponential(2) + "</td>\n                      </tr>";
        var names = "";
        if (d.images && d.images.length > 0) {
            names += "<div style='font-size:0.85em;'>";
            names += From(d.images)
                .Where(function (image) { return image && image.name && (image.name != "null"); })
                .Select(function (image) { return "<li>" + image.name + "</li>"; })
                .JoinBy("\n");
            names += "</div>";
        }
        names = "<tr>\n                    <td>names</td>\n                    <td>" + names + "</td>\n                 </tr>";
        return new StringBuilder("\"#" + d.id + "(" + color.type + ")", "\n")
            .AppendLine("<table>")
            .AppendLine(DEM)
            .AppendLine(log2FC)
            .AppendLine(pvalue)
            .AppendLine(names)
            .AppendLine("</table>")
            .AppendLine("<img src='./KEGG/Compounds/" + d.id + ".gif' style='opacity:0.5;' />")
            .toString();
    };
    CloudVizPlot.Colors = {
        "-": { value: "blue", type: "down-regulated" },
        "+": { value: "red", type: "up-regulated" }
    };
    return CloudVizPlot;
}());
//# sourceMappingURL=mzCloudPlot.js.map