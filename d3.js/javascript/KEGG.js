/// <reference path="../build/linq.d.ts"/>
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
/// <reference path="../build/KEGG_canvas.d.ts" />
var KEGG;
(function (KEGG) {
    var metabolism;
    (function (metabolism) {
        function AssemblyGraph(compounds) {
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
//# sourceMappingURL=KEGG.js.map