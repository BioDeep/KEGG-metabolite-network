namespace KEGG {

    export class compound {

        public ID: string;
        public name: string;
        public mass: string;
        public formula: string;
        /** 
         * base64 URI
        */
        public gif: string;

        public toString(): string {
            return this.name;
        }
    }

    /**
     * The KEGG compounds database
    */
    export const Compounds = {
        $data
    };
}