@echo off

REM do file copy

SET build=typescript\build
SET appjs=d3.js\javascript

REM delete old files

DEL "%appjs%\app.js"
DEL "%appjs%\svg.js"
DEL "%appjs%\KEGG_canvas.js"
DEL "%appjs%\KEGG.js"
DEL "%appjs%\linq.js"

REM copy new js files

COPY "%build%\app.js" "%appjs%\app.js"
COPY "%build%\svg.js" "%appjs%\svg.js"
COPY "%build%\KEGG_canvas.js" "%appjs%\KEGG_canvas.js"
COPY "%build%\KEGG.js" "%appjs%\KEGG.js"
COPY "%build%\linq.js" "%appjs%\linq.js"

pause