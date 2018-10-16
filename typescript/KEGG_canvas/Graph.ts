namespace Graph {

    export class edge {

        public A: string
        public B: string;
        public Data: {
            index: number,
            correlation: number,
            fdr: number
        }
        public id: string;
        public source: number;
        public target: number;
        public value: string;
        public weight: number;

    }

    export class node implements d3.layout.force.Node {

        public degree: number;
        public id: number;
        public name: string;
        public type: string[];
        public Data: {
            fdr: number,
            log2FC: number,
            p: number,
            color: string,
            KCF: string
        }

        public index?: number;
        public x?: number;
        public y?: number;
        public px?: number;
        public py?: number;
        public fixed?: boolean;
        public weight?: number;
    }

    export class Model {
        public edges: edge[];
        public nodes: node[];
        public style: string;
        public types: object;
    }
}