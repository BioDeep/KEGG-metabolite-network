namespace KEGGBrite {

    export interface IKEGGBrite {
        name: string;
        children: IKEGGBrite[];
    }

    export class IDEntry {

        public get commonName(): string {
            return this.names[0];
        }

        public constructor(
            public id: string,
            public names: string[]) {
        };
    }

    export interface IBriteEntry {
        entry: IDEntry;
        class_path: string[];
    }
}