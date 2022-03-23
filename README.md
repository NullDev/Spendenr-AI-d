# Spendenr-AI-d

<p align="center"><img height="300" width="auto" src="https://cdn.discordapp.com/attachments/618781839338897446/956072723166167070/unknown.png" /></p>
<p align="center"><b>AI powered Spendenraid Auswertung. </b></p>
<hr>

## :question: Was macht es?

Diese KI hilft bei der Spendenraid Auswertung. Sie klassifizert Bilder nach Kategorien und ermittelt den Spendenbetrag.

<hr>

## :wrench: Installation

0. Terminal aufmachen und dorthin navigieren, wo man es downloaden möchte <br><br>
1. Sichergehen, dass NodeJS installiert ist. Teste mit: <br>
$ `node -v` <br>
Wenn es eine Versionsnummer zurückgibt, ist NodeJS installiert.
 **Wenn nicht**, NodeJS <a href="https://nodejs.org/en/download/package-manager/">hier</a> downloaden. <br><br>
2. Repository clonen und hinein navigieren. Wenn Git installiert ist: <br>
$ `git clone https://github.com/pr0-dev/Spendenr-AI-d.git && cd Spendenr-AI-d` <br>
Wenn nicht, <a href="https://github.com/pr0-dev/Spendenr-AI-d/archive/master.zip">hier</a> herunterladen und die ZIP extrahieren. <br>
Dann in den Ordner navigieren.<br><br>
3. Dependencies installieren: <br>
$ `npm install`<br><br>
4. Das Config-Template [config.template.json](https://github.com/pr0-dev/Spendenr-AI-d/blob/master/config.template.json) kopieren und als `config.json` einfügen.<br><br>
5. Die frisch kopierte Config datei ausfüllen. <br><br>
6. Das Script starten <br>
$ `npm start` <br><br>

**Achtung**: Zusätzlich benötigte Module außerhalb von NPM: 
- Docker ([Installationsanleitung](https://docs.docker.com/engine/install/debian/#install-using-the-repository))
- Tesseract (`sudo apt install tesseract-ocr tesseract-ocr tesseract-ocr-deu`)

<hr>
