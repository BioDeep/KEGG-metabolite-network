declare namespace KEGGBrite {
    function parse(briteText: string): void;
}
interface IKEGGBrite {
    name: string;
    children: IKEGGBrite[];
}
interface IDEntry {
    id: string;
    names: string[];
}
