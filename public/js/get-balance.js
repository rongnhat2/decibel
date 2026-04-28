/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*************************************!*\
  !*** ./resources/js/get-balance.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }


// ===== INIT =====
window.addEventListener("load", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
  var fullAddr, apt;
  return _regenerator().w(function (_context) {
    while (1) switch (_context.n) {
      case 0:
        // Load balance
        fullAddr = localStorage.getItem("petra_address");
        _context.n = 1;
        return getAptBalance(fullAddr);
      case 1:
        apt = _context.v;
        document.getElementById("wallet-address").textContent = "".concat(fullAddr.slice(0, 6), "...").concat(fullAddr.slice(-6));
        document.getElementById("wallet-address-detail").textContent = "".concat(fullAddr.slice(0, 6), "...").concat(fullAddr.slice(-6));
        document.getElementById("apt-balance").textContent = apt + " APT";
        document.getElementById("wallet-address-detail").textContent = "".concat(fullAddr.slice(0, 6), "...").concat(fullAddr.slice(-6));
        document.getElementById("wallet-address-board").textContent = fullAddr;
      case 2:
        return _context.a(2);
    }
  }, _callee);
})));

// ===== LẤY APT BALANCE =====
function getAptBalance(_x) {
  return _getAptBalance.apply(this, arguments);
}
function _getAptBalance() {
  _getAptBalance = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(address) {
    var _balData$, baseUrl, accountRes, balRes, balData, octas, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          baseUrl = "https://fullnode.mainnet.aptoslabs.com/v1"; // Kiểm tra account tồn tại
          _context2.n = 1;
          return fetch("".concat(baseUrl, "/accounts/").concat(address));
        case 1:
          accountRes = _context2.v;
          if (!(accountRes.status === 404)) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, "0.0000");
        case 2:
          _context2.n = 3;
          return fetch("".concat(baseUrl, "/view"), {
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
        case 3:
          balRes = _context2.v;
          if (balRes.ok) {
            _context2.n = 4;
            break;
          }
          throw new Error("HTTP ".concat(balRes.status));
        case 4:
          _context2.n = 5;
          return balRes.json();
        case 5:
          balData = _context2.v;
          octas = BigInt((_balData$ = balData === null || balData === void 0 ? void 0 : balData[0]) !== null && _balData$ !== void 0 ? _balData$ : "0");
          return _context2.a(2, (Number(octas) / 1e8).toFixed(4));
        case 6:
          _context2.p = 6;
          _t = _context2.v;
          console.error("Balance error:", _t);
          return _context2.a(2, "0.0000");
      }
    }, _callee2, null, [[0, 6]]);
  }));
  return _getAptBalance.apply(this, arguments);
}
/******/ })()
;