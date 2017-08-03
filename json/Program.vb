Imports System.ComponentModel
Imports System.Drawing
Imports System.IO
Imports json.csv
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.ComponentModel.Ranges
Imports Microsoft.VisualBasic.Data.csv
Imports Microsoft.VisualBasic.Data.visualize.Network.FileStream.Json
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
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
    <Description("Conversion of the network graph table model as json data model")>
    Public Function Convert(args As CommandLine) As Integer
        Dim data = (args <= "/in").LoadCsv(Of network_Csv)
        Dim nodeDatas = (args <= "/nodes") _
            .LoadCsv(Of nodeData) _
            .ToDictionary(Function(x) x.names)
        Dim degreeSize As Boolean = args.GetBoolean("/degree_size")
        Dim compress As Boolean = args.GetBoolean("/min")
        Dim colors As (up As Color(), down As Color()) = (
            Designer.GetColors("RdPu:c9", 150).Skip(50).ToArray,
            Designer.GetColors("YlGnBu:c9", 150).Skip(50).ToArray)

        Dim up As New Dictionary(Of Double, Integer)
        Dim down As New Dictionary(Of Double, Integer)

        With nodeDatas.Values.VectorShadows
            With DirectCast(!Me(.log2FC > 0).log2FC.As(Of Double), Double())
                For Each i In .RangeTransform("0,100").SeqIterator
                    If Not up.ContainsKey(.ref(i)) Then
                        Call up.Add(.ref(i), CInt(i.value))
                    End If
                Next
            End With
        End With
        With nodeDatas.Values.VectorShadows
            With DirectCast(!Me(.log2FC < 0).log2FC.As(Of Double), Double())
                For Each i In .RangeTransform("0,100").SeqIterator
                    If Not down.ContainsKey(.ref(i)) Then
                        Call down.Add(.ref(i), CInt(i.value))
                    End If
                Next
            End With
        End With

        Dim rnd As New Random
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
            Let color As Color = Function() As Color
                                     If n.log2FC > 0 Then
                                         Return colors.up(up(n.log2FC))
                                     ElseIf n.log2FC < 0 Then
                                         Return colors.down(down(n.log2FC))
                                     Else
                                         Return Color.Black
                                     End If
                                 End Function()
            Select New node With {
                .type = rnd.Next(1, 5),
                .id = name.i,
                .name = label,
                .degree = d,
                .Data = New Dictionary(Of String, String) From {
                    {NameOf(nodeData.fdr), n.fdr},
                    {NameOf(nodeData.log2FC), n.log2FC},
                    {NameOf(nodeData.p), n.p},
                    {NameOf(color), color.ToHtmlColor}
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

        Dim groupColors As Color() = Designer.GetColors("Set1:c8")
        Dim net As New net With {
            .edges = edges,
            .nodes = nodes,
            .style = args.GetValue("/style", "default"),
            .types = .nodes _
                .Select(Function(x) x.type) _
                .Distinct _
                .SeqIterator _
                .ToDictionary(Function(t) t.value,
                              Function(c) groupColors(c).ToHtmlColor)
        }

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(net.GetJson(indent:=Not compress))
        End Using

        Return 0
    End Function
End Module