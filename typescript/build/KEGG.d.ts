/// <reference path="linq.d.ts" />
/**
 * The kegg brite index file parser
 *
 * https://www.kegg.jp/kegg/brite.html
*/
declare namespace KEGGBrite {
    /**
     * 将目标brite json文件或者对象解析为对象entry枚举
    */
    function parse(briteText: string | IKEGGBrite): IEnumerator<IBriteEntry>;
}
declare namespace KEGGBrite {
    interface IKEGGBrite {
        name: string;
        children: IKEGGBrite[];
    }
    class IDEntry {
        id: string;
        names: string[];
        readonly commonName: string;
        constructor(id: string, names: string[]);
    }
    interface IBriteEntry {
        entry: IDEntry;
        class_path: string[];
    }
}
