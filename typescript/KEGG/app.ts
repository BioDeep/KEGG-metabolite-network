namespace KEGGBrite {

    export function parse(briteText: string) {

    }

    function parseIDEntry(text: string): IDEntry {
        var list = text.split(/\s{2,}/g);
        var id: string = list[0];
        var names: string[] = $ts(list).Skip(1).Select(s => s.split(/;\s*/g)).Unlist(x => x).ToArray();

        return { id: id, names: names };
    }
}

interface IKEGGBrite {
    name: string;
    children: IKEGGBrite[];
}

interface IDEntry {
    id: string;
    names: string[];
}