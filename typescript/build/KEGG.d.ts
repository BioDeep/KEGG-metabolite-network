/// <reference path="linq.d.ts" />
/// <reference path="KEGG_canvas.d.ts" />
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
