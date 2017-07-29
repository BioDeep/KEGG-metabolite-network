Imports Microsoft.VisualBasic.Serialization.JSON

Namespace csv

    Public Class nodeData

        Public Property name As String
        Public Property CompoundType As String
        Public Property NODE_WIDTH As Double
        Public Property Data As Dictionary(Of String, String)

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class

    Public Class network_Csv

        Public Property canonicalName As String
        Public Property interaction As String
        Public Property source As String
        Public Property target As String
        Public Property Data As Dictionary(Of String, String)

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class
End Namespace