let IS_SERVER = typeof require !== 'undefined';

const app = (IS_SERVER ? require("vanu") : vanu)({
  baseController: "/page/",
  target: "#ssr-app"
});

app.use((ctx, next) => {
  ctx.api = (url) => fetch("./api" + url).then(r => r.json());
  next();
});

app.get("/", { controller: "contact.js" });
app.get("/about", { controller: "about.js" });
app.get("/help", { controller: "help.js" });
app.get("/:username", { controller: "user.js" });

if (!IS_SERVER) {
  //client only
  app.on("van:start", () => NProgress.start());
  app.on("van:end", () => NProgress.done());
  app.listen();
}

module.exports = app;
