/// <reference path="linq.d.ts" />
/**
 * The kegg brite index file parser
 *
 * https://www.kegg.jp/kegg/brite.html
*/
declare namespace KEGGBrite {
    function parse(briteText: string): IEnumerator<IBriteEntry>;
}
declare namespace KEGGBrite {
    interface IKEGGBrite {
        name: string;
        children: IKEGGBrite[];
    }
    interface IDEntry {
        id: string;
        names: string[];
    }
    interface IBriteEntry {
        entry: IDEntry;
        class_path: string[];
    }
}
