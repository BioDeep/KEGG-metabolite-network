Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject
Imports Microsoft.VisualBasic.Language.UnixBash
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.Language

Module KCF

    Dim compounds As New List(Of NamedValue(Of Compound))

    Public Sub CreateTable(imports$)
        For Each file$ In ls - l - r - "*.XML" <= [imports]
            Try
                compounds.Add(file, file.LoadXml(Of Compound))
            Catch ex As Exception

            End Try
        Next
    End Sub

    ''' <summary>
    ''' 返回来的是image的路径
    ''' </summary>
    ''' <param name="name$"></param>
    ''' <returns></returns>
    Public Function MatchByName(name$) As NamedValue(Of Compound)
        For Each compound In compounds
            With compound
                If .Value.MatchByName(name) Then
                    Return New NamedValue(Of Compound)(
                        .Name.TrimSuffix & ".gif",
                        .Value)
                End If
            End With
        Next

        Return Nothing
    End Function
End Module
