/// <reference path="linq.d.ts" />
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
