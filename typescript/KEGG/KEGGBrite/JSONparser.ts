/// <reference path="../../build/linq.d.ts"/>

/**
 * The kegg brite index file parser
 * 
 * https://www.kegg.jp/kegg/brite.html
*/
namespace KEGGBrite {

    export function parse(briteText: string): IEnumerator<IBriteEntry> {
        var tree: IKEGGBrite = JSON.parse(briteText);
        var list = new List<IBriteEntry>();

        for (var i: number = 0; i < tree.children.length; i++) {
            list.AddRange(treeTravel(tree.children[i]));
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
            class_path.push(Class.name);

            Class.children.forEach(node => treeTravel(node, class_path, list));
        }

        return list;
    }

    function parseIDEntry(text: string): IDEntry {
        var list = text.split(/\s{2,}/g);
        var id: string = list[0];
        var names: string[] = $ts(list)
            .Skip(1)
            .Select(s => s.split(/;\s*/g))
            .Unlist(x => x)
            .ToArray();

        return { id: id, names: names };
    }

    function isLeaf(node: IKEGGBrite): boolean {
        return $ts.isNullOrEmpty(node.children);
    }
}