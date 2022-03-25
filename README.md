# Spendenr-AI-d

<p align="center"><img height="450" width="auto" src="https://i.ibb.co/JpBCvDX/photo-2022-03-25-20-27-44.jpg" /></p>
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
- Python 3.8.10 ([Installationsanleitung](https://stackoverflow.com/a/62831268/7575111) (3.8.2 mit 3.8.10 ersetzen!))
- Tensorflow 2.4.0 (`pip install tensorflow==2.4.0`)

<hr>
