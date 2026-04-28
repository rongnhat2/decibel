/******/ (() => { // webpackBootstrap
/*!*******************************!*\
  !*** ./resources/js/index.js ***!
  \*******************************/
var _document$getElementB, _document$getElementB2;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function truncateAddress(address) {
  if (!address || address.length < 12) {
    return address || "-";
  }
  return "".concat(address.slice(0, 6), "...").concat(address.slice(-6));
}
function getAptBalance(_x) {
  return _getAptBalance.apply(this, arguments);
} // Toggle hide/show for secret key
function _getAptBalance() {
  _getAptBalance = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(address) {
    var _balanceData$, balanceRes, balanceData, octas, _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          if (address) {
            _context4.n = 1;
            break;
          }
          return _context4.a(2, "0.0000");
        case 1:
          _context4.p = 1;
          _context4.n = 2;
          return fetch("https://fullnode.testnet.aptoslabs.com/v1/view", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "function": "0x1::coin::balance",
              type_arguments: ["0x1::aptos_coin::AptosCoin"],
              arguments: [address]
            })
          });
        case 2:
          balanceRes = _context4.v;
          _context4.n = 3;
          return balanceRes.json();
        case 3:
          balanceData = _context4.v;
          octas = Number((_balanceData$ = balanceData === null || balanceData === void 0 ? void 0 : balanceData[0]) !== null && _balanceData$ !== void 0 ? _balanceData$ : 0);
          return _context4.a(2, (octas / 1e8).toFixed(4));
        case 4:
          _context4.p = 4;
          _t3 = _context4.v;
          console.error("Get APT balance error:", _t3);
          return _context4.a(2, "0.0000");
      }
    }, _callee4, null, [[1, 4]]);
  }));
  return _getAptBalance.apply(this, arguments);
}
function bindSecretToggle() {
  var secretEl = document.getElementById("dashboard-secret-key");
  var toggleBtn = document.getElementById("toggle-secret-key");
  if (!secretEl || !toggleBtn) {
    return;
  }
  var secretValue = localStorage.getItem("petra_secret_key") || "sk_live_9f3d2c8a7b1e";
  var revealed = false;
  toggleBtn.addEventListener("click", function () {
    revealed = !revealed;
    secretEl.textContent = revealed ? secretValue : "••••••••";
    toggleBtn.innerHTML = revealed ? '<i class="fi fi-rr-eye-crossed me-1"></i>Hide' : '<i class="fi fi-rr-eye me-1"></i>Show';
  });
}

// Add copy-to-clipboard button event
function bindCopyButton(buttonId, textId) {
  var btn = document.getElementById(buttonId);
  var textEl = document.getElementById(textId);
  if (!btn || !textEl) {
    return;
  }
  btn.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return navigator.clipboard.writeText((textEl.textContent || "").trim());
        case 1:
          _context.n = 3;
          break;
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.error("Copy failed:", _t);
        case 3:
          return _context.a(2);
      }
    }, _callee, null, [[0, 2]]);
  })));
}
window.addEventListener("load", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
  var fullAddress, shortAddress, dashboardAddress, headerAddress, headerAddressDetail, apt, dashboardApt, headerApt, usdcbl, usdcblEl, apiKeyEl;
  return _regenerator().w(function (_context2) {
    while (1) switch (_context2.n) {
      case 0:
        // Get address from localStorage, truncate, and display in UI
        fullAddress = localStorage.getItem("petra_address") || localStorage.getItem("petra_temp_address") || "";
        shortAddress = truncateAddress(fullAddress);
        dashboardAddress = document.getElementById("dashboard-wallet-address");
        if (dashboardAddress) {
          dashboardAddress.textContent = shortAddress;
        }
        headerAddress = document.getElementById("wallet-address");
        if (headerAddress) {
          headerAddress.textContent = shortAddress;
        }
        headerAddressDetail = document.getElementById("wallet-address-detail");
        if (headerAddressDetail) {
          headerAddressDetail.textContent = shortAddress;
        }

        // Fetch and display APT balance
        _context2.n = 1;
        return getAptBalance(fullAddress);
      case 1:
        apt = _context2.v;
        dashboardApt = document.getElementById("balance-apt");
        if (dashboardApt) {
          dashboardApt.textContent = apt;
        }
        headerApt = document.getElementById("apt-balance");
        if (headerApt) {
          headerApt.textContent = "".concat(apt, " APT");
        }

        // Set USDCBL balance if available
        usdcbl = localStorage.getItem("petra_usdcbl_balance") || "0.00";
        usdcblEl = document.getElementById("balance-usdcbl");
        if (usdcblEl) {
          usdcblEl.textContent = usdcbl;
        }

        // Set API key value from localStorage
        apiKeyEl = document.getElementById("dashboard-api-key");
        if (apiKeyEl) {
          apiKeyEl.textContent = localStorage.getItem("petra_api_key") || "xxxxxxxx...";
        }
        bindSecretToggle();
        bindCopyButton("copy-wallet-address", "dashboard-wallet-address");
        bindCopyButton("copy-api-key", "dashboard-api-key");
      case 2:
        return _context2.a(2);
    }
  }, _callee2);
})));

// Add clipboard copy for wallet address board
(_document$getElementB = document.getElementById("copy-wallet-address")) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener("click", function () {
  var address = document.getElementById("wallet-address-board").textContent.trim();
  navigator.clipboard.writeText(address);
  var btn = document.getElementById("copy-wallet-address");
  btn.innerHTML = '<i class="fi fi-rr-check me-1"></i>Copied!';
  setTimeout(function () {
    btn.innerHTML = '<i class="fi fi-rr-copy me-1"></i>Copy';
  }, 2000);
});

// Generate new API key button functionality
(_document$getElementB2 = document.getElementById("btn-generate-api-key")) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
  var btn, _document$getElementB3, getJwtToken, res, data, apiKeyEl, secretKeyEl, toggleBtn, visible, _t2;
  return _regenerator().w(function (_context3) {
    while (1) switch (_context3.p = _context3.n) {
      case 0:
        if (confirm("Generating a new API key will disable the previous one. Continue?")) {
          _context3.n = 1;
          break;
        }
        return _context3.a(2);
      case 1:
        btn = document.getElementById("btn-generate-api-key");
        btn.disabled = true;
        btn.textContent = "Generating...";
        _context3.p = 2;
        // Fetch JWT token from cookies
        getJwtToken = function getJwtToken() {
          var match = document.cookie.match(/jwt_token=([^;]+)/);
          return match ? match[1] : null;
        };
        _context3.n = 3;
        return fetch("/api/account/regenerate-credentials", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: "Bearer ".concat(getJwtToken()),
            // changed here
            Accept: "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
          }
        });
      case 3:
        res = _context3.v;
        _context3.n = 4;
        return res.json();
      case 4:
        data = _context3.v;
        if (res.ok) {
          _context3.n = 5;
          break;
        }
        throw new Error(data.error || "Generate error");
      case 5:
        // Show API key and secret key once
        apiKeyEl = document.getElementById("dashboard-api-key");
        secretKeyEl = document.getElementById("dashboard-secret-key");
        document.getElementById("api-key-row").style.display = "block";
        document.getElementById("secret-key-row").style.display = "block";
        apiKeyEl.textContent = data.api_key;
        secretKeyEl.textContent = data.secret_key; // display plain secret key once

        // Toggle visibility for secret key
        toggleBtn = document.getElementById("toggle-secret-key");
        visible = true;
        toggleBtn.innerHTML = '<i class="fi fi-rr-eye-crossed me-1"></i>Hide';
        toggleBtn.onclick = function () {
          visible = !visible;
          secretKeyEl.textContent = visible ? data.secret_key : "••••••••••••••••";
          toggleBtn.innerHTML = visible ? '<i class="fi fi-rr-eye-crossed me-1"></i>Hide' : '<i class="fi fi-rr-eye me-1"></i>Show';
        };

        // Copy button for API key
        (_document$getElementB3 = document.getElementById("copy-api-key")) === null || _document$getElementB3 === void 0 || _document$getElementB3.addEventListener("click", function () {
          navigator.clipboard.writeText(data.api_key);
          document.getElementById("copy-api-key").textContent = "Copied!";
          setTimeout(function () {
            document.getElementById("copy-api-key").innerHTML = '<i class="fi fi-rr-copy me-1"></i>Copy';
          }, 2000);
        });
        alert("⚠️ Save the Secret Key now! It will not be shown again after you reload the page.");
        _context3.n = 7;
        break;
      case 6:
        _context3.p = 6;
        _t2 = _context3.v;
        alert("Error: " + _t2.message);
      case 7:
        _context3.p = 7;
        btn.disabled = false;
        btn.innerHTML = '<i class="fi fi-rr-reload me-1"></i>Generate API Key';
        return _context3.f(7);
      case 8:
        return _context3.a(2);
    }
  }, _callee3, null, [[2, 6, 7, 8]]);
})));
/******/ })()
;