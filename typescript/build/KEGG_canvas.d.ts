/// <reference types="d3" />
declare module convexHullImpl {
    function JarvisMatch(points: canvasModels.Point[]): canvasModels.Point[];
}
declare namespace canvasModels {
    /**
     * 2D point
    */
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
        /**
         * Calculate the 2d distance to other point from this point.
        */
        dist(p2: Point): number;
        /**
         * Is this point equals to a given point by numeric value equals
         * of the ``x`` and ``y``?
        */
        Equals(p2: Point): boolean;
        toString(): string;
    }
    class Size {
        width: number;
        height: number;
        toString(): string;
    }
}
/**
 * Utils code that related to the html canvas node.
*/
declare class canvasUtils {
    /**
     * Serialize the svg node content to base64 string text value.
     *
     * @param id The ``svg`` node id attribute value.
    */
    static svg2base64(id: string): string;
    /**
     * Convert the svg image to png image and then do image file download.
     *
     * @param svgID The svg node ``id`` attribute value.
     * @param canvas_id The ``canvas`` node ``id`` attribute value.
     * @param fileName The file name for save the generated png image file.
    */
    static svg2png(svgID: string, canvas_id: string, fileName?: string): void;
}
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
declare class KEGG_canvas {
    size: canvasModels.Size;
    nodeMin: number;
    force: any;
    nodes: any;
    links: any;
    svg: any;
    names: {};
    nodecolor: {};
    loading_gif: HTMLImageElement;
    type_groups: {};
    type_colors: {};
    baseURL: string;
    loading_gif_small: HTMLImageElement;
    /**
     * Create tooltip element
    */
    tooltip: d3.Selection<any>;
    constructor();
    /**
     * 可以在后台按照类型为节点生成颜色
     */
    private colorNodes;
    private displayTooltip;
    private moveTooltip;
    private removeTooltip;
    private displayPreview;
    /**
     * 因为目前d3.js还不能够通过调整z-index来调整图层
     * 所以在这里先构建一个最开始图层，来避免polygon将网络的节点遮盖住，从而导致无法操作节点
     *
    */
    polygon_layer: any;
    setupGraph(graph: any): void;
    toggles: any[];
    /**
     * 在svg上面添加legend的rectangle以及相应的标签文本
     * 颜色和标签文本都来自于type_colors字典
     */
    private showLegend;
    /**
     * 实时计算出凸包，并绘制出凸包的多边形
     *
     */
    private convexHull_update;
    private adjustLayouts;
    /**
     * 这个函数所绘制的多边形将网络之中的节点都遮住了
     * 鼠标点击操作都无法进行了。。。。。
     *
     * 可能的解决方法有两个：
     *
     * 1. 现在需要通过位置判断来进行模拟点击？？？？
     * 2. 将polygon多边形放在最下层
     */
    private drawPolygons;
}
