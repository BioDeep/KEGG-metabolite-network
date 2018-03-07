#Region "Microsoft.VisualBasic::6189bf440bd5fce4a59c929a119c2931, ..\KEGG_canvas\json\Program.vb"

' Author:
' 
'       asuka (amethyst.asuka@gcmodeller.org)
'       xieguigang (xie.guigang@live.com)
'       xie (genetics@smrucc.org)
' 
' Copyright (c) 2016 GPL3 Licensed
' 
' 
' GNU GENERAL PUBLIC LICENSE (GPL3)
' 
' This program is free software: you can redistribute it and/or modify
' it under the terms of the GNU General Public License as published by
' the Free Software Foundation, either version 3 of the License, or
' (at your option) any later version.
' 
' This program is distributed in the hope that it will be useful,
' but WITHOUT ANY WARRANTY; without even the implied warranty of
' MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
' GNU General Public License for more details.
' 
' You should have received a copy of the GNU General Public License
' along with this program. If not, see <http://www.gnu.org/licenses/>.

#End Region

Imports System.ComponentModel
Imports System.Drawing
Imports System.IO
Imports KEGG_canvas.json.csv
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.ComponentModel.Collection
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
        If GetType(Program).Module.Assembly.Location.BaseName.TextEquals(App.AssemblyName) Then
            VBDebugger.ForceSTDError = True
        End If
    End Sub

    Public Function Main() As Integer
        Return GetType(Program).RunCLI(App.CommandLine)
    End Function

    Private Function getColors() As (up As Color(), down As Color())
        Dim up = Designer.GetColors("RdPu:c9", 150).Skip(50).ToArray
        Dim down = Designer.GetColors("YlGnBu:c9", 150).Skip(50).ToArray

        Return (up, down)
    End Function

    ''' <summary>
    ''' 
    ''' </summary>
    ''' <param name="in$"></param>
    ''' <param name="nodesTable$"></param>
    ''' <param name="kegKCF$"></param>
    ''' <param name="degreeSize"></param>
    ''' <param name="compress"></param>
    ''' <param name="style$"></param>
    ''' <param name="nodeID"></param>
    ''' <param name="maps$">如果指定了这个参数，则只会输出这个数组之中指定的途径的分组信息</param>
    ''' <returns></returns>
    Public Function Convert(in$, nodesTable$, kegKCF$, degreeSize As Boolean, compress As Boolean, style$, nodeID As Boolean, Optional maps$() = Nothing) As String
        Dim data = [in].LoadCsv(Of network_Csv)
        Dim nodeDatas = nodesTable _
            .LoadCsv(Of nodeData) _
            .ToDictionary(Function(x) x.names)
        Dim colors As (up As Color(), down As Color()) = getColors()
        Dim up As New Dictionary(Of Double, Integer)
        Dim down As New Dictionary(Of Double, Integer)

        Call "Fill data...".__DEBUG_ECHO

        With kegKCF

            If .DirectoryExists Then

                Call KCF.CreateTable(.ByRef)

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
                    For Each i In .RangeTransform("0,100").SeqIterator
                        If Not up.ContainsKey(.ByRef(i)) Then
                            Call up.Add(.ByRef(i), CInt(i.value))
                        End If
                    Next
                End With
            End With
            With nodeDatas.Values.VectorShadows
                With DirectCast(!Me(.log2FC < 0).log2FC.As(Of Double), Double())
                    For Each i In .RangeTransform("0,100").SeqIterator
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
            Let d = If(degreeSize,
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

        Dim groupColors As Color()
        Dim groupNames As Dictionary(Of String, String)

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
                            App.Argument("/style") Or "default".AsDefault,
                            args.GetBoolean("/node.id"))

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(json)
        End Using

        Return 0
    End Function
End Module
