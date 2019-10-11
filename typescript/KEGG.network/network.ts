/// <reference path="../build/KEGG_canvas.d.ts" />

namespace KEGG.metabolism {

    export function AssemblyGraph(compounds: compound[] | IEnumerator<compound>): Graph.Model {
        KEGG.metabolism.repository.writeLocalCache();
        return;

        if (!Array.isArray(compounds)) {
            compounds = (<IEnumerator<compound>>compounds).ToArray(false);
        }

        let nodes = getNodeTable(<any>compounds);

        return <Graph.Model>{
            nodes: nodes.Values.ToArray(false),
            edges: getLinks(nodes),
            style: "",
            types: null
        }
    }

    function getLinks(nodes: Dictionary<Graph.node>): Graph.edge[] {
        throw "";
    }

    function getNodeTable(compounds: compound[]): Dictionary<Graph.node> {
        throw "";
    }

    export interface compound {
        name: string;
        KEGG: string;
    }
}