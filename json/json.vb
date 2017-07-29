﻿Imports Microsoft.VisualBasic.Serialization.JSON

Namespace json

    Public Class net

        Public Property nodes As node()
        Public Property edges As edges()
        ''' <summary>
        ''' 优先加载的样式名称
        ''' </summary>
        ''' <returns></returns>
        Public Property style As String

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class

    Public Class edges
        Public Property srcId As Integer
        Public Property tarId As Integer
        Public Property source As String
        Public Property target As String
        Public Property correlation As String
        Public Property weight As String
        Public Property id As String
        Public Property Data As Dictionary(Of String, String)

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class

    Public Class node
        Public Property id As Integer
        Public Property name As String
        Public Property degree As Integer
        Public Property type As String
        Public Property Data As Dictionary(Of String, String)

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class
End Namespace