const express = require('express');
const fs = require('fs');
const clientDir = __dirname + "/client";

const loadFile = (file) => fs.readFileSync(clientDir + file, 'utf8');
const index = loadFile("/template.html");

const vanuApp = require('./client/vanu-app');
const db = require('./db');

function findAllContact() {
  return db;
}
function findByUsernameContact(username) {
  return db.find(e => e.username === username) || {};
}
module.exports = express()
  .use(express.static(clientDir))
  .use((req, res, next) => {
    req.seo = {
      title: ""
    }
    req.ssr = (initData) => {
      req.render = (fn) => {
        const html = index.replace("{{CONTENT}}", fn())
          .replace("{{TITLE}}", req.seo.title)
          .replace("{{INIT_SERVER_DATA}}", initData ? `<script id="__uServerData" type="application/json">${JSON.stringify(initData)}</script>` : "")
        res.send(html);
      };
      vanuApp.listen(req, initData);
    };
    next();
  })
  .get("/", (req, res) => {
    req.ssr(findAllContact());
  })
  .get("/:username", (req, res) => {
    req.ssr(findByUsernameContact(req.params.username));
  })
  .get("/api/contact", (req, res) => res.send(findAllContact()))
  .get("/api/contact/:username", (req, res) => res.send(findByUsernameContact(req.params.username)))
  .get("*", (req, res) => {
    req.ssr();
  });