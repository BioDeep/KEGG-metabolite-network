/// <reference path="svg.d.ts" />
/// <reference path="linq.d.ts" />
/// <reference types="d3" />
declare namespace ConvexHull {
    module impl {
        function JarvisMatch(points: Canvas.Point[]): Canvas.Point[];
    }
    class Polygon {
        group: string;
        points: TagPoint[];
        toString(): string;
    }
    class TagPoint extends Canvas.Point {
        group: string;
        toString(): string;
    }
}
declare namespace Graph {
    class edge {
        A: string;
        B: string;
        Data: {
            index: number;
            correlation: number;
            fdr: number;
        };
        id: string;
        source: number;
        target: number;
        value: string;
        weight: number;
    }
    class node implements d3.layout.force.Node {
        degree: number;
        id: number;
        name: string;
        type: string[];
        Data: {
            fdr: number;
            log2FC: number;
            p: number;
            color: string;
            KCF: string;
        };
        index?: number;
        x?: number;
        y?: number;
        px?: number;
        py?: number;
        fixed?: boolean;
        weight?: number;
    }
    class Model {
        edges: edge[];
        nodes: node[];
        style: string;
        types: object;
    }
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
*/
declare class KEGG_canvas {
    size: Canvas.Size;
    nodeMin: number;
    force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;
    nodes: Graph.node[];
    links: Graph.edge[];
    svg: d3.Selection<any>;
    names: {};
    nodecolor: {};
    type_groups: {};
    type_colors: {};
    baseURL: string;
    edgeOpacity: number;
    /**
     * Create tooltip element
    */
    tooltip: d3.Selection<any>;
    constructor(graph: Graph.Model);
    attachSaveAsPng(aId: string, fileName?: string): void;
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
    */
    polygon_layer: d3.Selection<any>;
    private Clear;
    private setupGraph;
    private toggles;
    /**
     * 在legend之中每一行文本之间的间隔高度值
    */
    dh: number;
    dw: number;
    /**
     * legend的外边框圆角矩形的radius
    */
    legendBoxRadius: number;
    /**
     * 在svg上面添加legend的rectangle以及相应的标签文本
     * 颜色和标签文本都来自于type_colors字典
     */
    private showLegend;
    private drawSerialsLegend;
    /**
     * 实时计算出凸包，并绘制出凸包的多边形
    */
    private convexHull_update;
    private calculatePolygon;
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
