let IS_SERVER = typeof require !== 'undefined';

// development change false
const isProduction = true;

const base_url = isProduction ? "https://vanilla-ssr-gilt.vercel.app/" : "http://localhost:3000";

const router = (IS_SERVER ? require("van-router") : vanRouter)({
  baseController: "/page/",
  target: "ssr-app"
});

const api = (url) => fetch(base_url + "/api" + url).then(r => r.json());

router.use((state, next) => {
  if (!IS_SERVER) return (IS_SERVER = !IS_SERVER);
  state.api = api;
  next();
});

router.get("/", { controller: "contact.js" });
router.get("/about", { controller: "about.js" });
router.get("/help", { controller: "help.js" });
router.get("/:username", { controller: "user.js" });

router.listen(IS_SERVER);

module.exports = { router, api };
