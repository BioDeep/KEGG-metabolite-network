/// <reference path="../../build/linq.d.ts"/>

/**
 * The kegg brite index file parser
 * 
 * https://www.kegg.jp/kegg/brite.html
*/
namespace KEGGBrite {

    /**
     * 将目标brite json文件或者对象解析为对象entry枚举
    */
    export function parse(briteText: string | IKEGGBrite): IEnumerator<IBriteEntry> {
        var tree: IKEGGBrite = typeof briteText == "string" ? JSON.parse(briteText) : briteText;
        var list = new List<IBriteEntry>();

        for (let node of tree.children) {
            list.AddRange(treeTravel(node));
        }

        return list;
    }

    /**
     * 进行递归构建
    */
    function treeTravel(Class: IKEGGBrite, class_path: string[] = [], list: IBriteEntry[] = []): IBriteEntry[] {
        if (isLeaf(Class)) {
            list.push({
                entry: parseIDEntry(Class.name),
                class_path: [...class_path]
            });
        } else {
            class_path = [...class_path];
            // there is a child count number in class name
            // removes this count number tags
            //
            // example as: Prokaryotes (5639)
            class_path.push(Class.name.replace(/\s+[(]\d+[)]/ig, ""));

            Class.children.forEach(node => treeTravel(node, class_path, list));
        }

        return list;
    }

    function parseIDEntry(text: string): IDEntry {
        var list = text.split(/\s{2,}/g);
        var id: string = list[0];
        var names: string[] = $from(list)
            .Skip(1)
            .Select(s => s.split(/;\s*/g))
            .Unlist(x => x)
            .ToArray();

        return new IDEntry(id, names);
    }

    function isLeaf(node: IKEGGBrite): boolean {
        return $ts.isNullOrEmpty(node.children);
    }
}