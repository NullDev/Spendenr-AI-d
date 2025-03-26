# Spendenr-AI-d

<p align="center"><img height="450" width="auto" src="https://i.ibb.co/JpBCvDX/photo-2022-03-25-20-27-44.jpg" /></p>
<p align="center"><b>AI powered Spendenraid evaluation. <br><sub>- With :heart: by TheShad0w</sub></b></p>
<hr>

## :question: What does it do?

This AI helps with the evaluations of donations during the pr0gramm "Spendenraid". It classifies pictures to see what organisation the donation was for, as well as the amount of money donated.

<hr>

## :information_source: Update

New version is OCR only.

Old ReadMe Below ⬇️

<hr>

## :information_source: Info

The AI operates multithreaded and asynchronous. It receives a "batch" of image ID's which are processed one after the other in a "queue" (image download, organisation classification, donation amount evaluation, image deletion, sending the result to the server). One worker thread is opened per batch. Batches can arrive in parallel, i.e. if one batch is currently being processed, another one can arrive at the same time. These are then processed independently of each other. It is recommended to deploy the whole project with [PM2](https://pm2.io/) in [Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/) with about 5 instances, so that another OSI-layer 7 horizontal scaling takes place. A ready-made configuration file is [available in the repository]((https://github.com/NullDev/Spendenr-AI-d/blob/master/pm2-service.config.json)).

To learn how the AI was trained, please refer [to the explanation in the classification script](https://github.com/NullDev/Spendenr-AI-d/blob/master/model/tag.py#L18-L27).

<hr>

## :wrench: Setup

0. Open up your favourite terminal (and navigate somewhere you want to download the repository to). <br><br>
1. Make sure you have NodeJS installed. Test by  entering <br>
$ `node -v` <br>
If this returns a version number, NodeJS is installed. **If not**, get NodeJS <a href="https://nodejs.org/en/download/package-manager/">here</a>. <br><br>
2. Clone the repository and navigate to it. If you have Git installed, type <br>
$ `git clone https://github.com/NullDev/Spendenr-AI-d.git && cd Spendenr-AI-d` <br>
If not, download it <a href="https://github.com/NullDev/Spendenr-AI-d/archive/master.zip">here</a> and extract the ZIP file.<br>
Then navigate to the folder.<br><br>
3. Install all dependencies by typing <br>
$ `npm install`<br><br>
4. Copy [config.template.json](https://github.com/NullDev/Spendenr-AI-d/blob/master/config.template.json) and paste it as `config.js` <br><br>
5. Configure it in your favourite editor by editing `config.json`<br><br>
6. Start it by running <br>
$ `npm start` <br>
or lint and start it by using <br>
$ `npm run dev` <br><br>

**Attention**: Additionally required modules besides NPM Dependencies: 
- Docker ([Install instructions](https://docs.docker.com/engine/install/debian/#install-using-the-repository))
- Tesseract (`sudo apt install tesseract-ocr tesseract-ocr tesseract-ocr-deu`)
- Python 3.8.10 ([Install instructions](https://stackoverflow.com/a/62831268/7575111) (replace 3.8.2 with 3.8.10 !))
- Tensorflow 2.4.0 (`pip install tensorflow==2.4.0`)

<hr>

## :heart: Acknowledgements

- [RundesBalli](https://github.com/RundesBalli) for his [Spendenraid System](https://github.com/RundesBalli/pr0gramm-Spendenraid)
- [Chiaki](https://pr0gramm.com/user/Chiaki) for [help with refactoring the classification python script](https://github.com/NullDev/Spendenr-AI-d/blob/master/model/tag.py)

<hr>
