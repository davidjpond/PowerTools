REM @echo off
set installpath="C:\Users\david.pond\Dropbox\local_projects\personal_projects\powertools\src\web_root"
c:
cd "c:\Program Files\PowerSchool\data\custom"
rmdir /s /q web_root
mklink /d web_root %installpath%
pause