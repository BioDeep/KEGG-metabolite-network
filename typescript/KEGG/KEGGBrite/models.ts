namespace KEGGBrite {

    export interface IKEGGBrite {
        name: string;
        children: IKEGGBrite[];
    }

    export interface IDEntry {
        id: string;
        names: string[];
    }

    export interface IBriteEntry {
        entry: IDEntry;
        class_path: string[];
    }
}