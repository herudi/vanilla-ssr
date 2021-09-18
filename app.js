const express = require('express');
const fs = require('fs');
const { parseHTML } = require('linkedom');
global.fetch = require("isomorphic-unfetch");
global.__baseClient = __dirname + "/client";

const loadFile = (file) => fs.readFileSync(__baseClient + file, 'utf8');
const index = loadFile("/template.html");
const { window, document } = parseHTML(index);
Object.assign(global, { window, document });

const { router, api } = require('./client/router');
const db = require('./db');

module.exports = express()
  .use(express.static(__baseClient))
  .use((req, res, next) => {
    req.api = api;
    next();
  })
  .get("/api/contact", (req, res) => res.send(db))
  .get("/api/contact/:username", (req, res) => res.send(db.find(e => e.username === req.params.username) || {}))
  .get("*", async (req, res, next) => {
    const html = await router.getHtml(req, res, next);
    if (html) req.end(html);
  });