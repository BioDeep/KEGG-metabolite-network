Imports System.IO
Imports json.csv
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Data.csv
Imports Microsoft.VisualBasic.Data.visualize.Network.FileStream.Json
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Linq
Imports Microsoft.VisualBasic.Serialization.JSON

Module Program

    Sub New()
        VBDebugger.ForceSTDError = True
    End Sub

    Public Function Main() As Integer
        Return GetType(Program).RunCLI(App.CommandLine)
    End Function

    <ExportAPI("/Convert")>
    <Usage("/Convert /in <data.csv> [/nodes <nodes.csv> /degree_size /min /style <default> /out <out.json/std_out>]")>
    Public Function Convert(args As CommandLine) As Integer
        Dim data = (args <= "/in").LoadCsv(Of network_Csv)
        Dim nodeDatas = (args <= "/nodes") _
            .LoadCsv(Of nodeData) _
            .ToDictionary(Function(x) x.name)
        Dim degreeSize As Boolean = args.GetBoolean("/degree_size")
        Dim compress As Boolean = args.GetBoolean("/min")
        Dim nodes = LinqAPI.Exec(Of node) <=
 _
            From name As SeqValue(Of String)
            In data.Select(Function(x) {x.source, x.target}) _
                .IteratesALL _
                .Distinct _
                .SeqIterator
            Let label As String = name.value
            Let n = nodeDatas.TryGetValue(label, [default]:=New nodeData)
            Let d = If(degreeSize,
                data _
                .Where(Function(x) x.source = label OrElse x.target = label) _
                .Count,
                n.degree)
            Select New node With {
                .type = 1,
                .id = name.i,
                .name = label,
                .degree = d,
                .Data = New Dictionary(Of String, String) From {
                    {NameOf(nodeData.fdr), n.fdr},
                    {NameOf(nodeData.log2FC), n.log2FC},
                    {NameOf(nodeData.p), n.p}
                }
            }

        Dim nodeTable = nodes.ToDictionary(Function(x) x.name)
        Dim edges = LinqAPI.Exec(Of edges) <=
 _
            From x As network_Csv
            In data
            Select New edges With {
                .value = x.Data.TryGetValue("correlation", [default]:=0),'x.correlation,
                .id = $"{x.source}..{x.target}",
                .A = x.source,
                .B = x.target,
                .weight = x.Data.TryGetValue("fdr", [default]:=0),' x.fdr,
                .source = nodeTable(x.source).id,
                .target = nodeTable(x.target).id,
                .Data = x.Data
            }

        Dim net As New net With {
            .edges = edges,
            .nodes = nodes,
            .style = args.GetValue("/style", "default")
        }

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(net.GetJson(indent:=Not compress))
        End Using

        Return 0
    End Function
End Module