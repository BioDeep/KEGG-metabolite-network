namespace KEGG {

    export class compound {

        public ID: string;
        public name: string;
        public mass: number;
        public formula: string;
        /** 
         * base64 URI
        */
        public gif: string;

        public constructor(obj: {
            ID: string,
            name: string,
            mass: number,
            formula: string,
            gif: string
        }) {
            this.ID = obj.ID;
            this.name = obj.name;
            this.mass = obj.mass;
            this.formula = obj.formula;
            this.gif = obj.gif;
        }

        public toString(): string {
            return this.name;
        }
    }

    Object.prototype["asModel"] = function () {
        return new compound(this);
    }

    /**
     * The KEGG compounds database
    */
    export const Compounds = {
        $data
    };
}