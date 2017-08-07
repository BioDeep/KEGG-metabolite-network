Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject
Imports Microsoft.VisualBasic.Language.UnixBash
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.Language

Module KCF

    Dim compounds As New List(Of NamedValue(Of Compound))

    Public Sub CreateTable(imports$)
        For Each file$ In ls - l - r - "*.XML" <= [imports]
            compounds.Add(file, file.LoadXml(Of Compound))
        Next
    End Sub

    ''' <summary>
    ''' 返回来的是image的路径
    ''' </summary>
    ''' <param name="name$"></param>
    ''' <returns></returns>
    Public Function MatchByName(name$) As String

    End Function
End Module
