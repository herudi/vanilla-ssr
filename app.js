const express = require('express');
const fs = require('fs');
const { parseHTML } = require('linkedom');
global.__baseClient = __dirname + "/client";

const loadFile = (file) => fs.readFileSync(__baseClient + file, 'utf8');
const index = loadFile("/template.html");
const { window, document } = parseHTML(index);
Object.assign(global, { window, document });

const vanuApp = require('./client/vanu-app');
const db = require('./db');

function findAllContact() {
  return db;
}
function findByUsernameContact(username) {
  return db.find(e => e.username === username) || {};
}
function vanuSSR(params) {
  
}

module.exports = express()
  .use(express.static(__baseClient))
  .use((req, res, next) => {
    req.vanuRender = (initData) => {
      const str = vanuApp.listen(req, res, initData);
      if (str === "404") res.send("<h1>404 not found</h1>");
    };
    next();
  })
  .get("/", (req, res) => {
    req.vanuRender(findAllContact());
  })
  .get("/:username", (req, res) => {
    req.vanuRender(findByUsernameContact(req.params.username));
  })
  .get("/api/contact", (req, res) => res.send(findAllContact()))
  .get("/api/contact/:username", (req, res) => res.send(findByUsernameContact(req.params.username)))
  .get("*", (req, res) => {
    req.vanuRender();
  });