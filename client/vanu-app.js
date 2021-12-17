let IS_SERVER = typeof require !== 'undefined';

const app = (IS_SERVER ? require("vanu") : vanu)({
  target: "#ssr-app"
});

app.use((ctx, next) => {
  ctx.seo = ctx.seo || document;
  ctx.api = (url) => fetch("./api" + url).then(r => r.json());
  ctx.import = (path) => IS_SERVER ? require(path)(ctx, next) : ctx.lazy(path + ".js")
  next();
});

app.get("/", (ctx) => ctx.import("./page/contact"));
app.get("/about", (ctx) => ctx.import("./page/about"));
app.get("/help", (ctx) => ctx.import("./page/help"));
app.get("/:username", (ctx) => ctx.import("./page/user"));

if (!IS_SERVER) {
  //client only
  app.on("vanu:start", () => NProgress.start());
  app.on("vanu:end", () => NProgress.done());
  app.listen();
}

module.exports = app;
