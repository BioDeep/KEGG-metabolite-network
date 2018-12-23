var KEGGBrite;
(function (KEGGBrite) {
    function parse(briteText) {
        var tree = JSON.parse(briteText);
    }
    KEGGBrite.parse = parse;
    function parseIDEntry(text) {
        var list = text.split(/\s{2,}/g);
        var id = list[0];
        var names = $ts(list).Skip(1).Select(function (s) { return s.split(/;\s*/g); }).Unlist(function (x) { return x; }).ToArray();
        return { id: id, names: names };
    }
    function isLeaf(node) {
        return IsNullOrEmpty(node);
    }
})(KEGGBrite || (KEGGBrite = {}));
interface;
//# sourceMappingURL=KEGG.js.map