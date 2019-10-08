/// <reference path="linq.d.ts" />
/// <reference path="KEGG_canvas.d.ts" />
declare namespace KEGG.metabolism.repository {
    interface KEGG_compound {
        ID: string;
        name: string;
        reaction: string;
        /**
         * base64 image
        */
        image: string;
    }
    interface KEGG_reaction {
        entry: string;
        name: string;
        substrates: string;
        products: string;
    }
    const reactions_table = "br08201";
    const compounds_table = "KEGG_compounds";
    /**
     * 从服务器拉取数据到本地通过indexdb缓存起来
    */
    function writeLocalCache(): void;
}
declare namespace KEGGBrite {
    function parse(briteText: string): IEnumerator<IBriteEntry>;
}
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
declare namespace KEGG.metabolism {
    function AssemblyGraph(compounds: compound[] | IEnumerator<compound>): Graph.Model;
    interface compound {
        name: string;
        KEGG: string;
    }
}
