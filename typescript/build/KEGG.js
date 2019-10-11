/// <reference path="../build/KEGG_canvas.d.ts" />
var KEGG;
(function (KEGG) {
    var metabolism;
    (function (metabolism) {
        function AssemblyGraph(compounds) {
            KEGG.metabolism.repository.writeLocalCache();
            return;
            if (!Array.isArray(compounds)) {
                compounds = compounds.ToArray(false);
            }
            var nodes = getNodeTable(compounds);
            return {
                nodes: nodes.Values.ToArray(false),
                edges: getLinks(nodes),
                style: "",
                types: null
            };
        }
        metabolism.AssemblyGraph = AssemblyGraph;
        function getLinks(nodes) {
            throw "";
        }
        function getNodeTable(compounds) {
            throw "";
        }
    })(metabolism = KEGG.metabolism || (KEGG.metabolism = {}));
})(KEGG || (KEGG = {}));
var KEGG;
(function (KEGG) {
    var metabolism;
    (function (metabolism) {
        var repository;
        (function (repository) {
            repository.reactions_table = "br08201";
            repository.compounds_table = "KEGG_compounds";
            /**
             * 从服务器拉取数据到本地通过indexdb缓存起来
            */
            function writeLocalCache() {
                if (!checkDbExists(repository.compounds_table)) {
                    TypeScript.logging.log("LocalDb cache '" + repository.compounds_table + "' is not exists, fetch data from server and write cache...", TypeScript.ConsoleColors.Blue);
                    // fetch data from server and 
                    // then write cache into local database
                    $ts.getText("kegg/" + repository.compounds_table + ".csv", writeCompoundsCache);
                }
            }
            repository.writeLocalCache = writeLocalCache;
            /**
             * 数据库的信息是保存在localstorage之中的
             * 使用服务器端的文件修改时间的unixtimestamp作为版本号
            */
            function checkDbExists(dbName) {
                var version = localStorage.getItem("versionOf-" + dbName);
                var check = Strings.Empty(version, true);
                return !check;
            }
            function writeCompoundsCache(raw) {
                var $compounds = $ts.csv.toObjects(raw);
                var localDbRequest = window.indexedDB.open(repository.compounds_table);
                var storeName = "compounds";
                localDbRequest.onsuccess = function (evt) {
                    this.db = evt.target.result;
                };
                localDbRequest.onupgradeneeded = function (evt) {
                    var localDb = evt.target.result;
                    if (!localDb.objectStoreNames.contains(storeName)) {
                        var store = localDb.createObjectStore("compounds", { autoIncrement: false });
                        var record = void 0;
                        var reactionId = void 0;
                        store.createIndex("ID", "ID", { unique: true });
                        for (var _i = 0, _a = $compounds.ToArray(false); _i < _a.length; _i++) {
                            var compound = _a[_i];
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
                };
            }
        })(repository = metabolism.repository || (metabolism.repository = {}));
    })(metabolism = KEGG.metabolism || (KEGG.metabolism = {}));
})(KEGG || (KEGG = {}));
/// <reference path="../../build/linq.d.ts"/>
/**
 * The kegg brite index file parser
 *
 * https://www.kegg.jp/kegg/brite.html
*/
var KEGGBrite;
(function (KEGGBrite) {
    function parse(briteText) {
        var tree = JSON.parse(briteText);
        var list = new List();
        for (var i = 0; i < tree.children.length; i++) {
            list.AddRange(treeTravel(tree.children[i]));
        }
        return list;
    }
    KEGGBrite.parse = parse;
    /**
     * 进行递归构建
    */
    function treeTravel(Class, class_path, list) {
        if (class_path === void 0) { class_path = []; }
        if (list === void 0) { list = []; }
        if (isLeaf(Class)) {
            list.push({
                entry: parseIDEntry(Class.name),
                class_path: class_path.slice()
            });
        }
        else {
            class_path = class_path.slice();
            class_path.push(Class.name);
            Class.children.forEach(function (node) { return treeTravel(node, class_path, list); });
        }
        return list;
    }
    function parseIDEntry(text) {
        var list = text.split(/\s{2,}/g);
        var id = list[0];
        var names = $ts(list)
            .Skip(1)
            .Select(function (s) { return s.split(/;\s*/g); })
            .Unlist(function (x) { return x; })
            .ToArray();
        return { id: id, names: names };
    }
    function isLeaf(node) {
        return $ts.isNullOrEmpty(node.children);
    }
})(KEGGBrite || (KEGGBrite = {}));
//# sourceMappingURL=KEGG.js.map