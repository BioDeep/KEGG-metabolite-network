Imports SMRUCC.genomics.Assembly.KEGG.DBGET.bGetObject

Module test

    Sub Main()
        Dim c As Compound = "D:\smartnucl_integrative\DATA\KEGG\KEGG_cpd\OtherUnknowns\C00001.xml".LoadXml(Of Compound)

        Call KCF.CreateTable("D:\smartnucl_integrative\DATA\KEGG\KEGG_cpd\Compounds with biological roles\Vitamins and Cofactors\Vitamins\Water-soluble vitamins [Fig]")

        Pause()
    End Sub
End Module
