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

Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.ComponentModel.DataStructures.BinaryTree
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.UnixBash
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

''' <summary>
''' Module for match for kegg KCF draw image
''' </summary>
Module KCF

    Dim compounds As New Dictionary(Of NamedValue(Of Compound))
    Dim nameTree As New BinaryTree(Of (name$, Compound))

    Public Iterator Function PopulateAllCompounds() As IEnumerable(Of (data As Compound, gif$))
        For Each data As NamedValue(Of Compound) In compounds.Values
            Yield (data.Value, gif:=data.Value.Image)
        Next
    End Function

    Public Function CreateTable(imports$) As BinaryTree(Of (name$, Compound))
        For Each file$ In ls - l - r - "*.XML" <= [imports]
            Dim compound As NamedValue(Of Compound)

            Try
                If file.BaseName.First = "C"c Then
                    compound = (file.BaseName, file.LoadXml(Of Compound), file)
                Else
                    compound = (file.BaseName, file.LoadXml(Of Glycan), file)
                End If
            Catch ex As Exception
                compound = Nothing
                ex = New Exception(file, ex)
                App.LogException(ex)
            End Try

            ' 因为在KEGG分类之中，一种代谢物可能会有多种生物学功能
            ' 所以可能会出现重复的记录
            ' 在这里需要判断下是否存在于字典之中
            If Not compound.IsEmpty And Not compounds.ContainsKey(compound.Name) Then
                Call compounds.Add(compound)

                With compound.Value
                    For Each name$ In .CommonNames
                        Call nameTree.insert(name, (file, .ByRef))
                    Next
                End With
            End If
        Next

        Return nameTree
    End Function

#Region "Match kegg compound by identifier"

    ' 下面的两个函数的返回值类型都是一样的

    ''' <summary>
    ''' 返回来的是image的路径
    ''' </summary>
    ''' <param name="name$"></param>
    ''' <returns></returns>
    Public Function MatchByName(name$) As NamedValue(Of Compound)
        Dim node = nameTree.FindSymbol(name)

        ' 没有找到
        If node Is Nothing Then
            Return Nothing
        Else
            Dim path$ = node.Value.name
            Dim gif$ = path.TrimSuffix & ".gif"
            Dim compound = node.Value.Item2

            Return New NamedValue(Of Compound) With {
                .Name = gif,
                .Value = compound
            }
        End If
    End Function

    ''' <summary>
    ''' ``{gif_file => model}``
    ''' </summary>
    ''' <param name="id$"></param>
    ''' <returns></returns>
    Public Function MatchById(id$) As NamedValue(Of Compound)
        If compounds.ContainsKey(id) Then
            Dim find = compounds(id)
            Dim gif = find.Name.TrimSuffix & ".gif"

            Return New NamedValue(Of Compound) With {
                .Name = gif,
                .Value = find.Value
            }
        Else
            Return Nothing
        End If
    End Function
#End Region
End Module

