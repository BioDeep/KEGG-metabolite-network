/// <reference path="../build/linq.d.ts" />
/// <reference path="../build/KEGG.d.ts" />
$ts.get("@data:test", function (resp) {
    console.log(KEGGBrite.parse(resp));
});
//# sourceMappingURL=index.js.map