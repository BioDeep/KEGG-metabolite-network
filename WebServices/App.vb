#Region "Microsoft.VisualBasic::4cf5997ca25103495d4fe36624c72878, KEGG_canvas\WebServices\App.vb"

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

    ' Class AppCanvas
    ' 
    '     Constructor: (+1 Overloads) Sub New
    '     Function: Render
    ' 
    ' /********************************************************************************/

#End Region

Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Serialization.JSON
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine.APIMethods
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine.APIMethods.Arguments
Imports SMRUCC.WebCloud.HTTPInternal.Platform

''' <summary>
''' 网络模型渲染任务后台
''' </summary>
<[Namespace]("KEGG_canvas")> Public Class AppCanvas : Inherits WebApp

    ReadOnly appPath As String

    Public Sub New(main As PlatformEngine)
        MyBase.New(main)

        appPath = App.GetVariable("render") Or $"{App.HOME}/render/KEGG_canvas.exe".AsDefault

        If appPath.FileExists Then
            Call $"Render Engine found at: {appPath}".__DEBUG_ECHO
        Else
            Call $"Render Api will not working unless you have put ``KEGG_canvas`` CLI to location: {appPath}".Warning
        End If
    End Sub

    ''' <summary>
    ''' 将KEGGid列表传递进来，然后输出文件渲染所需要的json文件字符串
    ''' 网站后台就可以直接使用这个json来进行可视化了
    ''' </summary>
    ''' <param name="request"></param>
    ''' <param name="response"></param>
    ''' <returns></returns>
    <ExportAPI("/KEGG_canvas/render.vbs")>
    <POST(GetType(String()))>
    Public Function Render(request As HttpPOSTRequest, response As HttpResponse) As Boolean
        Dim kegg$() = request.POSTData("kegg").LoadJSON(Of String())
        Dim tempfile = App.GetAppSysTempFile(".txt", App.PID)
        Dim outfile = App.GetAppSysTempFile(".json", App.PID)

        Call kegg.GetJson.__INFO_ECHO

        With New Program.KEGG_canvas(appPath)
            If Not .IsAvailable Then
                ' do nothing
                Call "Render Engine is Missing, could not process user request!".Warning
            Else
                Call kegg.FlushAllLines(tempfile)
                Call .ReconstructKEGGNetwork(tempfile, outfile)
                Call response.Write(outfile.ReadAllText)
            End If
        End With

        Return True
    End Function
End Class
