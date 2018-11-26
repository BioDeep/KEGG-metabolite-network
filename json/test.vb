#Region "Microsoft.VisualBasic::d7210f154a7b310ef1c103d491818288, KEGG_canvas\json\test.vb"

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

    ' Module test
    ' 
    '     Function: search
    ' 
    '     Sub: Main, plain
    ' 
    ' /********************************************************************************/

#End Region

Imports Microsoft.VisualBasic.Language
Imports Microsoft.VisualBasic.Language.UnixBash
Imports Microsoft.VisualBasic.Linq
Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

Module test

    Dim dir$ = "D:\smartnucl_integrative\DATA\KEGG\KEGG_cpd\"

    Sub Main()
        Dim c As Compound = "D:\smartnucl_integrative\DATA\KEGG\KEGG_cpd\OtherUnknowns\C00001.xml".LoadXml(Of Compound)

        Dim tree = KCF.CreateTable(dir)
        '  Call plain()

        plainList = tree.GetAllNodes.Select(Function(n) n.Value.Item2).Distinct.AsList

        Dim names = plainList.Select(Function(cp) cp.CommonNames).IteratesALL.ToArray


        For i As Integer = 0 To 2000

        Next

        Call BENCHMARK(Sub()
                           Dim start = App.ElapsedMilliseconds
                           Dim t, f As Integer

                           For Each name In names
                               ' Console.WriteLine("{0}: {1}", name, tree.FindSymbol(name) Is Nothing)
                               If tree.FindSymbol(name) Is Nothing Then
                                   t += 1
                               Else
                                   f += 1
                               End If
                           Next

                           Call $"tree cost {App.ElapsedMilliseconds - start} | {t} failures, {f} success".__DEBUG_ECHO
                       End Sub)
        Call BENCHMARK(Sub()
                           Dim start = App.ElapsedMilliseconds
                           Dim t, f As Integer

                           For Each name In names
                               ' console.WriteLine("{0}: {1}", name, search(name) Is Nothing)
                               If search(name) Is Nothing Then
                                   t += 1
                               Else
                                   f += 1
                               End If
                           Next

                           Call $"plain sequence cost {App.ElapsedMilliseconds - start} | {t} failures, {f} success".__DEBUG_ECHO
                       End Sub)

        Pause()
    End Sub


    Dim plainList As New List(Of Compound)

    Sub plain()
        For Each file$ In ls - l - r - "*.XML" <= dir
            Dim c As Compound

            If file.BaseName.First = "C"c Then
                c = file.LoadXml(Of Compound)
            Else
                c = file.LoadXml(Of Glycan)
            End If

            plainList.Add(c)
        Next
    End Sub

    Function search(name$) As Compound
        For Each C As Compound In plainList
            If C.MatchByName(name) Then
                Return C
            End If
        Next

        Return Nothing
    End Function
End Module

