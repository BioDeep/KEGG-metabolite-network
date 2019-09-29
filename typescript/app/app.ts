/// <reference path="../build/linq.d.ts" />
/// <reference path="../build/svg.d.ts" />
/// <reference path="../build/KEGG_canvas.d.ts" />
/// <reference path="../build/KEGG.d.ts" />

// 测试当前的浏览器是否支持HTML5的高级特性
if (SvgUtils.hasSVG2Feature()) {
    let dataURL: string = `./graph.json`;

    if ($ts.location.hasQueryArguments) {
        dataURL = `${dataURL}?${$ts.location.url.queryRawString}`;
    }

    $ts.get(dataURL, g => {
        let graph: any = Array.isArray(g.info) ? KEGG.metabolism.AssemblyGraph(g.info) : g.info;
        let viz = new KEGG_canvas(JSON.parse(graph), {
            charge: -200,
            linkDistance: 30
        });

        viz.attachSaveAsPng("#download-invoker");
    })
} else {
    alert("请使用最新版本的Google Chrome浏览器！");
}