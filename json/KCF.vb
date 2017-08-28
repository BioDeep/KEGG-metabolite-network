#Region "Microsoft.VisualBasic::6a608c74a6bacf4322b687abc3bc0c86, ..\KEGG_canvas\json\KCF.vb"

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

Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.UnixBash
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

Module KCF

    Dim compounds As New List(Of NamedValue(Of Compound))

    Public Sub CreateTable(imports$)
        For Each file$ In ls - l - r - "*.XML" <= [imports]
            Try
                If file.BaseName.First = "C"c Then
                    compounds.Add(file, file.LoadXml(Of Compound))
                Else
                    compounds.Add(file, file.LoadXml(Of Glycan))
                End If
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

    Public Function MatchById(id$) As NamedValue(Of Compound)
        For Each compound In compounds
            With compound
                If .Name.BaseName = id Then
                    Return New NamedValue(Of Compound)(
                        .Name.TrimSuffix & ".gif",
                        .Value)
                End If
            End With
        Next

        Return Nothing
    End Function
End Module

