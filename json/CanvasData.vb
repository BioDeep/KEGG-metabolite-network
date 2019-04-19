#Region "Microsoft.VisualBasic::b422511d2d63a3f291e25da72f2d8a01, KEGG_canvas\json\CanvasData.vb"

    ' Author:
    ' 
    '       xieguigang (gg.xie@bionovogene.com, BioNovoGene Co., LTD.)
    ' 
    ' Copyright (c) 2018 gg.xie@bionovogene.com, BioNovoGene Co., LTD.
    ' 
    ' 
    ' MIT License
    ' 
    ' 
    ' Permission is hereby granted, free of charge, to any person obtaining a copy
    ' of this software and associated documentation files (the "Software"), to deal
    ' in the Software without restriction, including without limitation the rights
    ' to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    ' copies of the Software, and to permit persons to whom the Software is
    ' furnished to do so, subject to the following conditions:
    ' 
    ' The above copyright notice and this permission notice shall be included in all
    ' copies or substantial portions of the Software.
    ' 
    ' THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    ' IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    ' FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    ' AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    ' LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    ' OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    ' SOFTWARE.



    ' /********************************************************************************/

    ' Summaries:

    ' Module CanvasData
    ' 
    '     Function: LoadKCFBase64, NetworkFromCsv, NetworkFromKEGGList, (+2 Overloads) RenderPathwayModule
    ' 
    ' /********************************************************************************/

#End Region

Imports System.Drawing
Imports System.Runtime.CompilerServices
Imports KEGG_canvas.json.csv
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.ComponentModel.Ranges
Imports Microsoft.VisualBasic.Data.visualize.Network.Analysis
Imports Microsoft.VisualBasic.Data.visualize.Network.FileStream.Json
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.UnixBash
Imports Microsoft.VisualBasic.Linq
Imports Microsoft.VisualBasic.Net.Http
Imports Microsoft.VisualBasic.Serialization.JSON
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject
Imports SMRUCC.genomics.Assembly.KEGG.WebServices
Imports SMRUCC.genomics.Model.Network.KEGG
Imports EdgeData = Microsoft.VisualBasic.Data.visualize.Network.FileStream.NetworkEdge

Public Module CanvasData

    <Extension>
    Public Function NetworkFromKEGGList(idlist As IEnumerable(Of String), reactions$, pathways$) As (nodes As node(), edges As edges())
        Dim compounds = idlist _
            .Distinct _
            .Select(AddressOf KCF.MatchById) _
            .Select(Function(t)
                        Return New NamedValue(Of String) With {
                            .Name = t.Value.Entry,
                            .Value = t.Value _
                                .CommonNames _
                                .ElementAtOrDefault(0, t.Value.Formula)
                        }
                    End Function) _
            .ToArray
        Dim inputsIndex As Index(Of String) = compounds.Keys.Indexing
        Dim network = ReactionTable.Load(reactions).BuildModel(compounds, delimiter:="|", extended:=True)
        Dim maps As Map() = (ls - l - r - "*.Xml" <= pathways) _
            .Select(AddressOf LoadXml(Of Map)) _
            .ToArray

        Call network.AssignNodeClassFromPathwayMaps(maps, delimiter:="|")
        Call network.ComputeNodeDegrees

        Dim nodes As Dictionary(Of String, node) = network.Nodes _
            .Select(Function(node, i)
                        Dim degree = If(node.ID Like inputsIndex, node!degree, 1)
                        Dim log2FC = If(node.ID Like inputsIndex, 3, 1)
                        Dim color As Color = If(node.ID Like inputsIndex, Color.AliceBlue, Color.Black)
                        Dim KCF As String = KEGG_canvas.json.KCF.MatchById(node.ID).LoadKCFBase64()

                        Return New node With {
                            .name = node.ID,
                            .id = i + 1,
                            .degree = degree,
                            .type = Strings.Split(node.NodeType, FunctionalNetwork.Delimiter).JoinBy("|"),
                            .Data = New Dictionary(Of String, String) From {
                                {NameOf(nodeData.fdr), 0.05},
                                {NameOf(nodeData.log2FC), log2FC},
                                {NameOf(nodeData.p), 0.05},
                                {NameOf(color), color.ToHtmlColor},
                                {"KCF", KCF}
                            }
                        }
                    End Function) _
            .ToDictionary(Function(node) node.name)
        Dim getEdgeType = Function(edge As EdgeData)
                              If Not edge.FromNode Like inputsIndex OrElse Not edge.ToNode Like inputsIndex Then
                                  Return "dashed"
                              Else
                                  Return "solid"
                              End If
                          End Function
        Dim edges = LinqAPI.Exec(Of edges) <=
 _
           From x
           In network.Edges
           Let vizType As String = getEdgeType(x)
           Select New edges With {
               .value = vizType,
               .id = $"{x.FromNode}..{x.ToNode}",
               .A = x.FromNode,
               .B = x.ToNode,
               .weight = 1,
               .source = nodes(x.FromNode).id,
               .target = nodes(x.ToNode).id,
               .Data = New Dictionary(Of String, String) From {
                   {"fdr", 0.05}
               }
           }

        Return (nodes.Values.ToArray, edges)
    End Function

    <Extension>
    Private Function LoadKCFBase64(compound As NamedValue(Of Compound)) As String
        With compound
            If Not .Name.StringEmpty AndAlso .Name.FileExists Then
                Return .Name.LoadImage.ToBase64String
            Else
                Return Nothing
            End If
        End With
    End Function

    Public Function NetworkFromCsv(data As network_Csv(), nodeDatas As Dictionary(Of String, nodeData), opts As Arguments) As (nodes As node(), edges As edges())
        Dim colors As (up As Color(), down As Color()) = Program.getColors()
        Dim up As New Dictionary(Of Double, Integer)
        Dim down As New Dictionary(Of Double, Integer)

        Call "Fill data...".__DEBUG_ECHO

        With opts.kegKCF

            If .DirectoryExists Then

                Call KCF.CreateTable(.ByRef)

                If opts.nodeID Then
                    For Each node In nodeDatas
                        Dim id = node.Key
                        Dim cpd = KCF.MatchById(id)

                        If Not cpd.Value Is Nothing Then
                            If Not cpd.Value.CommonNames.IsNullOrEmpty Then
                                node.Value.names = cpd.Value.CommonNames.First
                            End If
                        End If
                    Next

                    ' 在这里还需要更新一下字典的键名，否则后面的查找都是以commonName来查找
                    ' 但是这个字典之中的键名任然是KEGG化合物编号，则数据肯定都无法找到的
                    nodeDatas = nodeDatas _
                        .Values _
                        .GroupBy(Function(d) d.names) _
                        .ToDictionary(Function(d) d.Key,
                                      Function(g) g.First)

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

        Call "Calc log2FC effects...".__DEBUG_ECHO

        Try
            With nodeDatas.Values.VectorShadows
                With DirectCast(!Me(.log2FC > 0).log2FC.As(Of Double), Double())
                    For Each i As SeqValue(Of Double) In .RangeTransform("0,100").SeqIterator
                        If Not up.ContainsKey(.ByRef(i)) Then
                            Call up.Add(.ByRef(i), CInt(i.value))
                        End If
                    Next
                End With
            End With
            With nodeDatas.Values.VectorShadows
                With DirectCast(!Me(.log2FC < 0).log2FC.As(Of Double), Double())
                    For Each i As SeqValue(Of Double) In .RangeTransform("0,100").SeqIterator
                        If Not down.ContainsKey(.ByRef(i)) Then
                            Call down.Add(.ByRef(i), CInt(i.value))
                        End If
                    Next
                End With
            End With
        Catch ex As Exception
            Call ex.PrintException
        End Try

        Call "Create JSON node...".__DEBUG_ECHO

        Dim nodes = LinqAPI.Exec(Of node) <=
 _
            From name As SeqValue(Of String)
            In data.Select(Function(x) {x.source, x.target}) _
                .IteratesALL _
                .Distinct _
                .SeqIterator
            Let label As String = name.value
            Let n = nodeDatas.TryGetValue(label, [default]:=New nodeData)
            Let d = If(opts.degreeSize,
                data _
                .Where(Function(x)
                           Return x.source = label OrElse x.target = label
                       End Function) _
                .Count,
                n.degree)
            Let color As Color = Function() As Color
                                     If n.log2FC > 0 Then
                                         If up.ContainsKey(n.log2FC) Then
                                             Return colors.up(up(n.log2FC))
                                         Else
                                             Return Color.LightPink
                                         End If
                                     ElseIf n.log2FC < 0 Then
                                         If down.ContainsKey(n.log2FC) Then
                                             Return colors.down(down(n.log2FC))
                                         Else
                                             Return Color.LightBlue
                                         End If
                                     Else
                                         Return Color.Black
                                     End If
                                 End Function()
            Let keg As NamedValue(Of Compound) = KCF.MatchByName(label)
            Let KCF = keg.LoadKCFBase64
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

        Call "Create JSON edge...".__DEBUG_ECHO

        Dim nodeTable = nodes.ToDictionary(Function(x) x.name)
        Dim edges = LinqAPI.Exec(Of edges) <=
 _
            From x As network_Csv
            In data
            Select New edges With {
                .value = x.Data.TryGetValue("correlation", [default]:=x.interaction),'x.correlation,
                .id = $"{x.source}..{x.target}",
                .A = x.source,
                .B = x.target,
                .weight = x.Data.TryGetValue("fdr", [default]:=0),' x.fdr,
                .source = nodeTable(x.source).id,
                .target = nodeTable(x.target).id,
                .Data = x.Data
            }

        Return (nodes, edges)
    End Function

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    <Extension>
    Public Function RenderPathwayModule(network As (nodes As node(), edges As edges()),
                                        Optional maps$() = Nothing,
                                        Optional style$ = "default") As net
        ' shortcuts
        Return RenderPathwayModule(network.nodes, network.edges, maps, style)
    End Function

    ''' <summary>
    ''' 
    ''' </summary>
    ''' <param name="nodes"></param>
    ''' <param name="edges"></param>
    ''' <param name="maps$"></param>
    ''' <param name="style$"></param>
    ''' <returns></returns>
    Public Function RenderPathwayModule(nodes As node(), edges As edges(), maps$(), style$) As net
        Dim groupColors As Color()
        Dim groupNames As Dictionary(Of String, String)
        Dim nodeTable = nodes.ToDictionary(Function(x) x.name)

        Call "Rendering group colors...".__DEBUG_ECHO

        If maps.IsNullOrEmpty Then
            groupColors = {
            Color.SteelBlue, Color.SkyBlue, Color.Teal, Color.DarkMagenta, Color.PaleTurquoise, Color.PaleGreen, Color.Crimson, Color.DodgerBlue
        }
            ' = Designer.GetColors("d3.scale.category10()") _
            '    .Take(8) _
            '    .ToArray

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

            groupNames = pathways _
                .ToDictionary(Function(x) x.Key,
                              Function(name) name.First)
        Else
            Dim mapIndex As Index(Of String) = maps.Indexing
            Dim pathways = nodes _
              .Where(Function(x) Not x.type.StringEmpty) _
              .Select(Function(x) x.type.Split("|"c)) _
              .IteratesALL _
              .GroupBy(Function(x) x.Split.First) _
              .Where(Function(g) mapIndex(g.Key.Trim("["c, "]"c).Trim) > -1) _
              .ToArray

            groupNames = pathways _
                .ToDictionary(Function(x) x.Key,
                              Function(name) name.First)

            If groupNames.Count > 30 Then
                groupColors = Designer.GetColors("scibasic.category31()", groupNames.Count + 1)
            Else
                groupColors = Designer.GetColors("scibasic.category31()")
            End If

        End If

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

        Return New net With {
            .edges = edges,
            .nodes = nodes,
            .style = style,
            .types = groupNames.Values _
                .SeqIterator _
                .ToDictionary(Function(t) t.value,
                              Function(c) groupColors(c).ToHtmlColor)
        }
    End Function
End Module
