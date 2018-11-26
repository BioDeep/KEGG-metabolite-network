#Region "Microsoft.VisualBasic::77f7f34f09bd48d5c539b87e43f45dbe, KEGG_canvas\json\KCF.vb"

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

    ' Module KCF
    ' 
    '     Function: CreateTable, MatchById, MatchByName, PopulateAllCompounds
    ' 
    ' /********************************************************************************/

#End Region

Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.ComponentModel.DataSourceModel
Imports Microsoft.VisualBasic.ComponentModel.Algorithm.BinaryTree
Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.UnixBash
Imports Microsoft.VisualBasic.Terminal.ProgressBar
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

''' <summary>
''' Module for match for kegg KCF draw image
''' </summary>
Module KCF

    Dim compounds As New Dictionary(Of NamedValue(Of Compound))
    Dim nameTree As New NaiveBinaryTree(Of String, (name$, Compound))(AddressOf String.CompareOrdinal, Function(name) name)

    Public Iterator Function PopulateAllCompounds() As IEnumerable(Of (data As Compound, gif$))
        For Each data As NamedValue(Of Compound) In compounds.Values
            Yield (data.Value, gif:=data.Value.Image)
        Next
    End Function

    Public Function CreateTable(imports$) As NaiveBinaryTree(Of String, (name$, Compound))
        Dim proc As New SwayBar

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
                Call proc.Step()

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
