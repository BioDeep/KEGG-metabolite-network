#Region "Microsoft.VisualBasic::2796960db53458a52e2034d2f99277c4, KEGG_canvas\json\Program.vb"

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

    ' Module Program
    ' 
    '     Constructor: (+1 Overloads) Sub New
    '     Function: Convert, getColors, KCFJson, Main, ReconstructKEGGNetwork
    ' 
    ' /********************************************************************************/

#End Region

Imports System.ComponentModel
Imports System.Drawing
Imports System.IO
Imports KEGG_canvas.json.csv
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Data.csv
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.Default
Imports Microsoft.VisualBasic.Linq
Imports Microsoft.VisualBasic.Net.Http
Imports Microsoft.VisualBasic.Serialization.JSON
Imports Microsoft.VisualBasic.Text
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

Public Module Program

    Sub New()
        If GetType(Program).Module _
                           .Assembly _
                           .Location _
                           .BaseName _
                           .TextEquals(App.AssemblyName) Then

            VBDebugger.ForceSTDError = True
        End If
    End Sub

    Public Function Main() As Integer
        Return GetType(Program).RunCLI(App.CommandLine)
    End Function

    Public Function getColors() As (up As Color(), down As Color())
        Dim up = Designer.GetColors("RdPu:c9", 150).Skip(50).ToArray
        Dim down = Designer.GetColors("YlGnBu:c9", 150).Skip(50).ToArray

        Return (up, down)
    End Function

    ''' <summary>
    ''' 这里的网络关系是由``/in``参数所提供的
    ''' </summary>
    ''' <param name="args"></param>
    ''' <returns></returns>
    <ExportAPI("/Convert")>
    <Usage("/Convert /in <data.csv> [/keg.KCF <directory> /node.id /nodes <nodes.csv> /degree_size /min /style <default> /out <out.json/std_out>]")>
    <Description("Conversion of the network graph table model as json data model")>
    <Argument("/min", True, CLITypes.Boolean, PipelineTypes.undefined,
              AcceptTypes:={GetType(Boolean)},
              Description:="Output a compressed json string?")>
    Public Function Convert(args As CommandLine) As Integer
        Dim degreeSize As Boolean = args.GetBoolean("/degree_size")
        Dim compress As Boolean = args.GetBoolean("/min")
        Dim nodeDatas = (args <= "/nodes") _
            .LoadCsv(Of nodeData) _
            .ToDictionary(Function(x) x.names)
        Dim edges As network_Csv() = (args <= "/in").LoadCsv(Of network_Csv)
        Dim json$ = CanvasData.NetworkFromCsv(
            edges, nodeDatas, New Arguments With {
                .compress = compress,
                .degreeSize = degreeSize,
                .kegKCF = args <= "/keg.kcf",
                .nodeID = args("/node.id"),
                .style = args("/style") Or "default".AsDefault
        }).RenderPathwayModule(Nothing, args("/style") Or "default".AsDefault) _
          .GetJson(indent:=Not compress)

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(json)
        End Using

        Return 0
    End Function

    ''' <summary>
    ''' Reconstruct kegg network through a given kegg compounds id list.
    ''' 
    ''' 这里的网络关系需要通过Reactions关系来进行推导
    ''' </summary>
    ''' <param name="args"></param>
    ''' <returns></returns>
    ''' 
    <ExportAPI("/Reconstruct.KEGG.Network")>
    <Usage("/Reconstruct.KEGG.Network /list <kegg.compound.list.txt> /reactions <repository> /compounds <repository> /pathways <repository> [/min /out <*.json/std_out>]")>
    <Argument("/min", True, CLITypes.Boolean, PipelineTypes.undefined,
              AcceptTypes:={GetType(Boolean)},
              Description:="Output a compressed json string?")>
    Public Function ReconstructKEGGNetwork(args As CommandLine) As Integer
        Dim list$() = (args <= "/list").ReadAllLines
        Dim compress As Boolean = args("/min")

        Call KCF.CreateTable([imports]:=args <= "/compounds")

        Dim json$ = list _
            .NetworkFromKEGGList(reactions:=args <= "/reactions", pathways:=args <= "/pathways") _
            .RenderPathwayModule() _
            .GetJson(indent:=Not compress)

        Using out As StreamWriter = args.OpenStreamOutput("/out")
            Call out.Write(json)
        End Using

        Return 0
    End Function

    <ExportAPI("/KCF.ts")>
    <Usage("/KCF.ts /repo <input_repository> [/out <KCF.ts>]")>
    <Description("Convert the kcf image repository as an typescript module.")>
    Public Function KCFJson(args As CommandLine) As Integer
        Dim data As New List(Of String)
        Dim missing As DefaultValue(Of String) = New DataURI(My.Resources.unknown_document_318_30514).ToString

        With args <= "/repo"

            If Not .DirectoryExists Then
                Throw New FileNotFoundException($"Missing repository at location: { .ByRef}")
            End If

            Call KCF.CreateTable(.ByRef)

            For Each compound In KCF.PopulateAllCompounds
                data += $"  {compound.data.Entry}: <compound> {{
                    ID: ""{compound.data.Entry}"",
                    name: {compound.data.CommonNames.GetJson},
                    mass: {compound.data.ExactMass},
                    formula: ""{compound.data.Formula}"",
                    gif: `{(compound.gif Or missing).Trim(" "c, ASCII.CR, ASCII.LF, ASCII.TAB)}`
                }}"
            Next

            Dim ts$ = data.JoinBy(",")

            Return TextEncodings _
                .UTF8WithoutBOM _
                .GetString(My.Resources.template) _
                .Replace("$data", ts) _
                .SaveTo(args("/out") Or $"{ .TrimDIR}.ts") _
                .CLICode
        End With
    End Function
End Module
