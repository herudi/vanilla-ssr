function vanu() {
  const w = window;
  const opts = arguments[0] || {};
  const _base = w.document.querySelector("base");
  let baseController = opts.baseController || "", base = _base ? _base.getAttribute("href") : "";
  if (opts.base) base = opts.base;
  if (base === "/") base = "";
  let timeout = opts.timeout || 300, elem = opts.target;
  let parse = opts.parse || ((str) => Object.fromEntries(new w.URLSearchParams(str).entries()));
  if (typeof elem === "string") elem = w.document.querySelector(elem);
  let lazy = (js, name) => ({ load }) => load(js, name);
  let cFile = (file) => file.indexOf("?") !== -1 ? file.split("?")[0] : file;
  let wares = [], ctrl = {};
  let onError = (_, s) => s.render(() => ""), unmount, current, vNow = "?v=" + Date.now(), isTimeout;
  let dispatch = (name) => w.dispatchEvent(new w.Event(name));
  let goState = (url, type = "pushState", notLoad) => {
    w.history[type]({}, "", url);
    w.__uHandler(notLoad);
  };
  let isServer = true;
  const getNodeType = function (node) {
    if (node.nodeType === 3) return 'text';
    if (node.nodeType === 8) return 'comment';
    return node.tagName.toLowerCase();
  };
  const getNodeContent = function (node, attr) {
    if (attr) {
      if (typeof node[attr] !== "string") return node.getAttribute(attr);
      return node[attr];
    }
    if (node.childNodes && node.childNodes.length > 0) return null;
    return node.textContent;
  };
  const stringToHTML = (str) => {
    const el = w.document.createElement("div");
    el.innerHTML = str;
    return el;
  };
  const diff = function (template, elem) {
    let domNodes = Array.prototype.slice.call(elem.childNodes);
    let templateNodes = Array.prototype.slice.call(template.childNodes);
    let count = domNodes.length - templateNodes.length;
    if (count > 0) {
      for (; count > 0; count--) {
        domNodes[domNodes.length - count].parentNode.removeChild(domNodes[domNodes.length - count]);
      }
    }
    templateNodes.forEach(function (node, index) {
      if (!domNodes[index]) {
        elem.appendChild(node.cloneNode(true));
        return;
      }
      let type = getNodeType(node);
      let domType = getNodeType(domNodes[index]);
      if (type !== domType) {
        domNodes[index].parentNode.replaceChild(node.cloneNode(true), domNodes[index]);
        return;
      }
      if (node.attributes && node.attributes.length) {
        let i = 0, len = node.attributes.length;
        while (i < len) {
          const attr = node.attributes[i];
          if (attr.name) {
            const tpl = getNodeContent(node, attr.name) || "";
            const tplDom = getNodeContent(domNodes[index], attr.name) || "";
            if (tpl !== tplDom) {
              domNodes[index][attr.name] = tpl;
            }
          }
          i++;
        };
      }
      let templateContent = getNodeContent(node);
      if (templateContent && templateContent !== getNodeContent(domNodes[index])) {
        domNodes[index].textContent = templateContent;
      }
      if (domNodes[index].childNodes.length > 0 && node.childNodes.length < 1) {
        domNodes[index].innerHTML = '';
        return;
      }
      if (domNodes[index].childNodes.length < 1 && node.childNodes.length > 0) {
        let fragment = w.document.createDocumentFragment();
        diff(node, fragment);
        domNodes[index].appendChild(fragment);
        return;
      }
      if (node.childNodes.length > 0) {
        diff(node, domNodes[index]);
      }
    });
  };
  const listenLink = (isRender) => {
    let links = (isRender ? elem : w.document).querySelectorAll("[u-link]");
    links.forEach((link) => {
      link.handle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let loc = link.getAttribute("href") || link.getAttribute("u-link");
        if (current !== loc) {
          w.history.pushState({}, "", loc);
          w.__uHandler();
        }
      };
      link.addEventListener("click", link.handle);
    });
  }
  const end = (isListen) => {
    if (isTimeout) clearTimeout(isTimeout);
    dispatch("vanu:end");
    if (isListen && !isServer) listenLink(true);
  }
  let cbs = {}, countCb = 0, reRender;
  const render = (fn) => {
    const tpl = stringToHTML(fn());
    diff(tpl, elem);
    end(tpl.querySelector("[u-link]"));
  }
  w.__uEvent = (i, t, e) => cbs[i].call(t, e);
  const toFunc = (cb) => {
    const name = (cb.name || ++countCb);
    cbs[name] = cb;
    return `return __uEvent('${name}', this, event)`;
  }
  return {
    routes: [],
    html(arr) {
      const subs = [].slice.call(arguments, 1);
      return arr.reduce((a, b, c) => {
        let val = subs[c - 1];
        if (typeof val === "function" && toFunc !== void 0) val = toFunc(val);
        return a + String(val) + b;
      });
    },
    find(path) {
      let fns, params = {}, j = 0, el, arr = this.routes, len = arr.length;
      while (j < len) {
        el = arr[j];
        if (el.rgx.test(path)) {
          if (el.isParam) params = el.rgx.exec(path).groups || {};
          fns = el.fns;
          break;
        }
        j++;
      }
      return { fns, params };
    },
    on(name, fn) {
      if (name === "vanu:error") onError = fn;
      else if (name === "vanu:start") w.addEventListener(name, fn);
      else if (name === "vanu:end") w.addEventListener(name, fn);
      return this;
    },
    handle(not, req) {
      if (!not) isTimeout = setTimeout(() => dispatch("vanu:start"), timeout);
      if (unmount) { unmount(); unmount = void 0; };
      let { pathname: path, search, hash: h } = req || w.location, i = 0;
      if (h) {
        if (path[path.length - 1] === "/") path = path.slice(0, -1);
        path = (path === "/" ? "/" : path + "/") + h.substring(2);
        current = h + search;
      } else current = path + search;
      cbs = {}, countCb = 0;
      let { fns, params } = this.find(path);
      const ctx = req || { url: current };
      ctx.isServer = isServer;
      ctx.params = params;
      ctx.query = ctx.query || (search ? parse(search.substring(1)) : {});
      ctx.html = this.html;
      ctx.go = (url, type) => goState(url, type, true);
      ctx.unmount = (fn) => { unmount = fn; return ctx; };
      if (!isServer) {
        ctx.initServerData = void 0;
      } else {
        if (ctx.__uServerData) {
          ctx.initServerData = ctx.__uServerData;
        } else if (w.document.getElementById("__uServerData")) {
          ctx.initServerData = JSON.parse(w.document.getElementById("__uServerData").textContent);
        }
      }
      const next = (err) => err ? onError(err, ctx) : fns[i++](ctx, next);
      ctx.render = ctx.render || ((fn) => {
        reRender = fn;
        render(fn);
      });
      ctx.target = (_elem) => {
        if (!_elem) return;
        elem = typeof _elem === "string" ? w.document.querySelector(_elem) : _elem;
      }
      ctx.useValue = (val) => {
        return {
          get value() {
            return val;
          },
          set value(newVal) {
            val = newVal;
            if (reRender) render(reRender);
          }
        }
      }
      ctx.load = (file, name) => {
        if (req) return req.loadScript(baseController + file)(ctx, next);
        file = cFile(file);
        file = baseController + file;
        name = name || file.substring(file.lastIndexOf("/") + 1).replace(".js", "");
        if (ctrl[file]) return w[name](ctx, next);
        ctrl[file] = true;
        const script = w.document.createElement("script");
        script.src = file + vNow;
        script.type = "text/javascript";
        w.document.head.appendChild(script);
        script.onload = () => w[name](ctx, next);
      };
      if (!fns) fns = [(s) => s.render(() => "")];
      fns = wares.concat(fns);
      next();
      isServer = false;
    },
    use() {
      wares = wares.concat([].slice.call(arguments));
      return this;
    },
    listen(req, res, initData) {
      if (!req) {
        if (!w.__uHandler) w.__uHandler = (e) => this.handle(e);
        w.__uHandler();
        listenLink();
        w.addEventListener("popstate", () => {
          if (current !== w.location.hash) w.__uHandler();
        });
      } else {
        isServer = true;
        if (initData) req.__uServerData = initData;
        req.res = req.res || res;
        req.pathname = req.path || req.url.split("?")[0];
        req.loadScript = req.loadScript || ((file) => require(__baseClient + file));
        req.render = (fn) => {
          elem.innerHTML = fn();
          let html = w.document.documentElement.outerHTML.replace("{{INIT_SERVER_DATA}}", initData ? `<script id="__uServerData" type="application/json">${JSON.stringify(initData)}</script>` : "")
          if (res.send) return res.send(html);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        }
        this.handle(true, req);
      }
    },
    get(url) {
      url = base + url;
      let fns = [].slice.call(arguments, 1), last = fns[fns.length - 1];
      if (typeof last === "object") fns = fns.slice(0, -1).concat([lazy(last.controller, last.name)]);
      const isParam = url.indexOf("/:") !== -1;
      url = url.replace(/\/$/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3");
      if (/\*|\./.test(url)) url = url.replace(/(\/?)\*/g, "($1.*)?").replace(/\.(?=[\w(])/, "\\.");
      this.routes.push({ fns, rgx: new RegExp(`^${url}/*$`), isParam });
      return this;
    }
  };
}

module.exports = vanu;