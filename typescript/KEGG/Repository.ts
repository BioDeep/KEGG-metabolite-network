namespace KEGG.metabolism.repository {

    export interface KEGG_compound {
        ID: string;
        name: string;
        reaction: string;
        /**
         * base64 image
        */
        image: string;
    }

    export interface KEGG_reaction {
        entry: string;
        name: string;
        substrates: string;
        products: string;
    }

    export const reactions_table = "br08201";
    export const compounds_table = "KEGG_compounds";

    /**
     * 从服务器拉取数据到本地通过indexdb缓存起来
    */
    export function writeLocalCache() {
        let localDbRequest = window.indexedDB.open(compounds_table);

        localDbRequest.onupgradeneeded = function (event: any) {
            TypeScript.logging.log(`LocalDb cache '${compounds_table}' is not exists, fetch data from server and write cache...`, TypeScript.ConsoleColors.Blue);
            // close current connection
            event.target.transaction.abort();
            // fetch data from server and 
            // then write cache into local database
            $ts.getText(`kegg/${compounds_table}.csv`, writeCompoundsCache);
        }
    }

    function writeCompoundsCache(raw: string) {
        let $compounds = $ts.csv.toObjects<KEGG_compound>(raw);
        let localDbRequest = window.indexedDB.open(compounds_table);

        localDbRequest.onsuccess = function () {
            let localDb = localDbRequest.result;
            let store = localDb.createObjectStore("compounds", { autoIncrement: false });
            let record: { ID: string, name: string, reaction: string[], image: string };
            let reactionId: string[];

            store.createIndex("ID", "ID", { unique: true });

            for (let compound of $compounds.ToArray(false)) {
                reactionId = Strings.Empty(compound.reaction, true) ? [] : compound.reaction.split("|");
                record = {
                    ID: compound.ID, name: compound.name, image: compound.image,
                    reaction: reactionId
                };

                TypeScript.logging.log(record);

                localDb.transaction(["compounds"], "readwrite")
                    .objectStore("compounds")
                    .add(record);
            }
        }
    }
}