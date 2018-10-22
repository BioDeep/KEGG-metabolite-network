Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine.APIMethods
Imports SMRUCC.WebCloud.HTTPInternal.AppEngine.APIMethods.Arguments
Imports SMRUCC.WebCloud.HTTPInternal.Platform

<[Namespace]("app")> Public Class App : Inherits WebApp

    Public Sub New(main As PlatformEngine)
        MyBase.New(main)
    End Sub

    ''' <summary>
    ''' 将KEGGid列表传递进来，然后输出文件渲染所需要的json文件字符串
    ''' 网站后台就可以直接使用这个json来进行可视化了
    ''' </summary>
    ''' <param name="request"></param>
    ''' <param name="response"></param>
    ''' <returns></returns>
    <ExportAPI("/app/render.vbs")>
    <POST(GetType(String()))>
    Public Function Render(request As HttpPOSTRequest, response As HttpResponse) As Boolean

    End Function
End Class
