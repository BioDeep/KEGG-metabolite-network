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
        public value: number;
        public weight: number;

    }

    export class node {
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
    }

    export class Model {
        public edges: edge[];
        public nodes: node[];
        public style: string;
        public types: object;
    }
}