#Region "Microsoft.VisualBasic::5d1bb0372cad725a7e299e491d7137c5, KEGG_canvas\WebServices\KEGG_canvas.vb"

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

    ' Class KEGG_canvas
    ' 
    '     Constructor: (+1 Overloads) Sub New
    ' 
    ' 
    ' /********************************************************************************/

#End Region

Imports System.Text
Imports Microsoft.VisualBasic.CommandLine
Imports Microsoft.VisualBasic.CommandLine.InteropService
Imports Microsoft.VisualBasic.ApplicationServices

' Microsoft VisualBasic CommandLine Code AutoGenerator
' assembly: ..\App\KEGG_canvas.exe

' 
'  // 
'  // 
'  // 
'  // VERSION:   1.0.0.*
'  // COPYRIGHT: Copyright ?  2016
'  // GUID:      d4300fae-4cf1-40f8-874f-c4a9fd8e17f1
'  // 
' 
' 
'  < KEGG_canvas.json.Program >
' 
' 
' SYNOPSIS
' KEGG_canvas command [/argument argument-value...] [/@set environment-variable=value...]
' 
' All of the command that available in this program has been list below:
' 
'  /Convert:                      Conversion of the network graph table model as json data model
'  /KCF.ts:                       Convert the kcf image repository as an typescript module.
'  /Reconstruct.KEGG.Network:     
' 
' 
' ----------------------------------------------------------------------------------------------------
' 
'    You can using "KEGG_canvas ??<commandName>" for getting more details command help.

Namespace Program


''' <summary>
''' KEGG_canvas.json.Program
''' </summary>
'''
Public Class KEGG_canvas : Inherits InteropService

    Public Const App$ = "KEGG_canvas.exe"

    Sub New(App$)
        MyBase._executableAssembly = App$
    End Sub

''' <summary>
''' ```
''' /Convert /in &lt;data.csv> [/keg.KCF &lt;directory> /node.id /nodes &lt;nodes.csv> /degree_size /min /style &lt;default> /out &lt;out.json/std_out>]
''' ```
''' Conversion of the network graph table model as json data model
''' </summary>
'''
Public Function Convert([in] As String, Optional keg_kcf As String = "", Optional nodes As String = "", Optional style As String = "", Optional out As String = "", Optional node_id As Boolean = False, Optional degree_size As Boolean = False, Optional min As Boolean = False) As Integer
    Dim CLI As New StringBuilder("/Convert")
    Call CLI.Append(" ")
    Call CLI.Append("/in " & """" & [in] & """ ")
    If Not keg_kcf.StringEmpty Then
            Call CLI.Append("/keg.kcf " & """" & keg_kcf & """ ")
    End If
    If Not nodes.StringEmpty Then
            Call CLI.Append("/nodes " & """" & nodes & """ ")
    End If
    If Not style.StringEmpty Then
            Call CLI.Append("/style " & """" & style & """ ")
    End If
    If Not out.StringEmpty Then
            Call CLI.Append("/out " & """" & out & """ ")
    End If
    If node_id Then
        Call CLI.Append("/node.id ")
    End If
    If degree_size Then
        Call CLI.Append("/degree_size ")
    End If
    If min Then
        Call CLI.Append("/min ")
    End If


    Dim proc As IIORedirectAbstract = RunDotNetApp(CLI.ToString())
    Return proc.Run()
End Function

''' <summary>
''' ```
''' /KCF.ts /repo &lt;input_repository> [/out &lt;KCF.ts>]
''' ```
''' Convert the kcf image repository as an typescript module.
''' </summary>
'''
Public Function KCFJson(repo As String, Optional out As String = "") As Integer
    Dim CLI As New StringBuilder("/KCF.ts")
    Call CLI.Append(" ")
    Call CLI.Append("/repo " & """" & repo & """ ")
    If Not out.StringEmpty Then
            Call CLI.Append("/out " & """" & out & """ ")
    End If


    Dim proc As IIORedirectAbstract = RunDotNetApp(CLI.ToString())
    Return proc.Run()
End Function

''' <summary>
''' ```
''' /Reconstruct.KEGG.Network /list &lt;kegg.compound.list.txt> [/min /out &lt;*.json/std_out>]
''' ```
''' </summary>
'''
Public Function ReconstructKEGGNetwork(list As String, Optional out As String = "", Optional min As Boolean = False) As Integer
    Dim CLI As New StringBuilder("/Reconstruct.KEGG.Network")
    Call CLI.Append(" ")
    Call CLI.Append("/list " & """" & list & """ ")
    If Not out.StringEmpty Then
            Call CLI.Append("/out " & """" & out & """ ")
    End If
    If min Then
        Call CLI.Append("/min ")
    End If


    Dim proc As IIORedirectAbstract = RunDotNetApp(CLI.ToString())
    Return proc.Run()
End Function
End Class
End Namespace




