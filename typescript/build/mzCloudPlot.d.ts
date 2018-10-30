/// <reference path="linq.d.ts" />
/// <reference path="svg.d.ts" />
declare class CloudCircle {
    id: string;
    size: number;
    depth: number;
    /**
     * Y坐标轴
    */
    mz: number;
    /**
     * X坐标轴
    */
    rt: number;
    /**
     * 当前物质的质谱比对图
    */
    images: {
        name: string;
    }[];
}
declare class CloudVizPlot {
    private svg;
    private tip;
    private size;
    private static readonly Colors;
    constructor(margin?: Canvas.Margin);
    /**
     * 在这里构建出具体的tooltip行为
    */
    private createTooltip;
    private static tooltipHtml;
}
