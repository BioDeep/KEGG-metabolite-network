Imports Microsoft.VisualBasic.Data.csv.StorageProvider.Reflection
Imports Microsoft.VisualBasic.Serialization.JSON

Namespace csv

    Public Class nodeData

        Public Property names As String
        Public Property degree As Integer
        Public Property p As Double
        Public Property fdr As Double
        Public Property log2FC As Double

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class

    Public Class network_Csv

        Public Property canonicalName As String
        Public Property interaction As String
        <Column("compoundA")> Public Property source As String
        <Column("compoundB")> Public Property target As String
        Public Property Data As Dictionary(Of String, String)

        Public Overrides Function ToString() As String
            Return Me.GetJson
        End Function
    End Class
End Namespace