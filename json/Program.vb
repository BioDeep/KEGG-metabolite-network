Imports System.ComponentModel
Imports System.Drawing
Imports System.IO
Imports json.csv
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.ComponentModel.Ranges
Imports Microsoft.VisualBasic.Data.csv
Imports Microsoft.VisualBasic.Data.visualize.Network.FileStream.Json
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Linq
Imports Microsoft.VisualBasic.Net.Http
Imports Microsoft.VisualBasic.Serialization.JSON
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

Public Module Program

    Sub New()
        VBDebugger.ForceSTDError = True
    End Sub

    Public Function Main() As Integer
        Return GetType(Program).RunCLI(App.CommandLine)
    End Function

    Public Function Convert(in$, nodesTable$, kegKCF$, degreeSize As Boolean, compress As Boolean, style$, nodeID As Boolean) As String
        Dim data = [in].LoadCsv(Of network_Csv)
        Dim nodeDatas = nodesTable _
            .LoadCsv(Of nodeData) _
            .ToDictionary(Function(x) x.names)
        Dim colors As (up As Color(), down As Color()) = (
            Designer.GetColors("RdPu:c9", 150).Skip(50).ToArray,
            Designer.GetColors("YlGnBu:c9", 150).Skip(50).ToArray)

        Dim up As New Dictionary(Of Double, Integer)
        Dim down As New Dictionary(Of Double, Integer)

        With kegKCF

            If .DirectoryExists Then

                Call KCF.CreateTable(.ref)

                If nodeID Then
                    For Each node In nodeDatas
                        Dim id = node.Key
                        Dim cpd = KCF.MatchById(id)

                        If Not cpd.Value Is Nothing Then
                            If Not cpd.Value.CommonNames.IsNullOrEmpty Then
                                node.Value.names = cpd.Value.CommonNames.First
                            End If
                        End If
                    Next

                    For Each edge As network_Csv In data
                        Dim a = KCF.MatchById(edge.source)
                        Dim b = KCF.MatchById(edge.target)

                        If Not a.Value Is Nothing AndAlso Not a.Value.CommonNames.IsNullOrEmpty Then
                            edge.source = a.Value.CommonNames.First
                        End If
                        If Not b.Value Is Nothing AndAlso Not b.Value.CommonNames.IsNullOrEmpty Then
                            edge.target = b.Value.CommonNames.First
                        End If
                    Next
                End If
            End If
        End With

        Try
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
        Catch ex As Exception
            Call ex.PrintException
        End Try

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
            Let keg As NamedValue(Of Compound) = KCF.MatchByName(label)
            Let KCF = If(Not keg.Name.StringEmpty AndAlso keg.Name.FileExists,
                keg.Name.LoadImage.ToBase64String,
                Nothing)
            Let pathwayGroup = keg.Value?.Pathway.SafeQuery.ToArray
            Select New node With {
                .type = pathwayGroup.JoinBy("|"),
                .id = name.i,
                .name = label,
                .degree = d,
                .Data = New Dictionary(Of String, String) From {
                    {NameOf(nodeData.fdr), n.fdr},
                    {NameOf(nodeData.log2FC), n.log2FC},
                    {NameOf(nodeData.p), n.p},
                    {NameOf(color), color.ToHtmlColor},
                    {"KCF", KCF}
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
        Dim pathways = nodes _
            .Where(Function(x) Not x.type.StringEmpty) _
            .Select(Function(x) x.type.Split("|"c)) _
            .IteratesALL _
            .GroupBy(Function(x) x.Split.First) _
            .Where(Function(g) g.Count > 3) _
            .OrderByDescending(
                Function(g)
                    Dim nid = g.First

                    Return Aggregate node As node
                           In nodeTable _
                               .Values _
                               .Where(Function(n) InStr(n.type, nid, CompareMethod.Text) > 0)
                           Into Average(node.degree)
                End Function) _
            .Take(groupColors.Length) _
            .ToArray
        Dim groupNames = pathways _
            .ToDictionary(Function(x) x.Key,
                          Function(name) name.First)

        Call groupNames.GetJson.__INFO_ECHO

        For Each node As node In nodes
            Dim types = node.type _
                ?.Split("|"c) _
                 .SafeQuery _
                 .Where(Function(t)
                            Return groupNames.ContainsKey(t.Split.First)
                        End Function) _
                 .JoinBy("|")
            node.type = types
        Next

        Dim net As New net With {
            .edges = edges,
            .nodes = nodes,
            .style = style,
            .types = groupNames.Values _
                .SeqIterator _
                .ToDictionary(Function(t) t.value,
                              Function(c) groupColors(c).ToHtmlColor)
        }

        Return net.GetJson(indent:=Not compress)
    End Function

    <ExportAPI("/Convert")>
    <Usage("/Convert /in <data.csv> [/keg.KCF <directory> /node.id /nodes <nodes.csv> /degree_size /min /style <default> /out <out.json/std_out>]")>
    <Description("Conversion of the network graph table model as json data model")>
    Public Function Convert(args As CommandLine) As Integer
        Dim degreeSize As Boolean = args.GetBoolean("/degree_size")
        Dim compress As Boolean = args.GetBoolean("/min")
        Dim json$ = Convert(args <= "/in",
                            args <= "/nodes",
                            args <= "/keg.KCF",
                            degreeSize, compress,
                            args.GetValue("/style", "default"),
                            args.GetBoolean("/node.id"))

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(json)
        End Using

        Return 0
    End Function
End Module