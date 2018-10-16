/// <reference path="../build/linq.d.ts"/>
/// <reference path="../build/svg.d.ts"/>

class CloudVizPlot {

    private svg: d3.Selection<any>;
    private tip: d3.Tooltip;
    private size: Canvas.Size;

    private static readonly Colors = {
        "-": { value: "blue", type: "down-regulated" },
        "+": { value: "red", type: "up-regulated" }
    };

    public constructor(margin: Canvas.Margin = <Canvas.Margin>{ top: 0, right: 50, bottom: 0, left: 0 }) {
        this.svg = d3.select("svg");
        this.size = <Canvas.Size>{
            width: parseFloat(this.svg.attr("width")) - margin.left - margin.right,
            height: parseFloat(this.svg.attr("height")) - margin.top - margin.bottom
        }

        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        this.tip = this.createTooltip();
    }

    /**
     * 在这里构建出具体的tooltip行为
    */
    private createTooltip(): d3.Tooltip {
        return d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(d => CloudVizPlot.tooltipHtml(<any>d));
    }

    private static tooltipHtml(d: CloudCircle): string {
        var color = CloudVizPlot.Colors[d.size > 0 ? "+" : "-"];
        var DEM = `<tr>
                      <td>DEM(m/z@rt):</td>
                      <td>
                        <strong>
                            <span style='color:${color.value}'>
                                ${d.mz.toFixed(2)}@${Math.abs(d.rt).toFixed(2)}
                            </span>
                        </strong>
                      </td>
                   </tr>`;
        var log2FC = `<tr>
                         <td>log<sub>2</sub>FC:</td>
                         <td>${d.size.toFixed(2)}</td>
                      </tr>`;
        var pvalue = `<tr>
                         <td>p-value:</td>
                         <td>${Math.pow(10, -d.depth).toExponential(2)}</td>
                      </tr>`;
        var names = "";

        if (d.images && d.images.length > 0) {
            names += "<div style='font-size:0.85em;'>"
            names += From(d.images)
                .Where(image => image && image.name && (image.name != "null"))
                .Select(image => `<li>${image.name}</li>`)
                .JoinBy("\n");
            names += "</div>"
        }

        names = `<tr>
                    <td>names</td>
                    <td>${names}</td>
                 </tr>`

        return new StringBuilder(`"#${d.id}(${color.type})`, "\n")
            .AppendLine("<table>")
            .AppendLine(DEM)
            .AppendLine(log2FC)
            .AppendLine(pvalue)
            .AppendLine(names)
            .AppendLine("</table>")
            .AppendLine(`<img src='./KEGG/Compounds/${d.id}.gif' style='opacity:0.5;' />`)
            .toString();
    }
}