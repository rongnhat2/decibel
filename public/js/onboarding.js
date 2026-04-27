/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./resources/js/decibel-onboarding.js"
/*!********************************************!*\
  !*** ./resources/js/decibel-onboarding.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   runOnboarding: () => (/* binding */ runOnboarding)
/* harmony export */ });
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function csrf() {
  var token = document.querySelector('meta[name="csrf-token"]');
  return token ? token.content : "";
}
function postJson(_x, _x2) {
  return _postJson.apply(this, arguments);
}
function _postJson() {
  _postJson = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url, payload) {
    var res, data;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-CSRF-TOKEN": csrf()
            },
            body: JSON.stringify(payload)
          });
        case 1:
          res = _context.v;
          _context.n = 2;
          return res.json();
        case 2:
          data = _context.v;
          if (res.ok) {
            _context.n = 3;
            break;
          }
          throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Request failed");
        case 3:
          return _context.a(2, data);
      }
    }, _callee);
  }));
  return _postJson.apply(this, arguments);
}
function runOnboarding(_x3) {
  return _runOnboarding.apply(this, arguments);
}
function _runOnboarding() {
  _runOnboarding = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(options) {
    var _ref, walletAddress, builderAddress, _ref$startStep, startStep, onStep, onSuccess, onError, bot, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _ref = options || {}, walletAddress = _ref.walletAddress, builderAddress = _ref.builderAddress, _ref$startStep = _ref.startStep, startStep = _ref$startStep === void 0 ? 1 : _ref$startStep, onStep = _ref.onStep, onSuccess = _ref.onSuccess, onError = _ref.onError;
          _context2.p = 1;
          if (walletAddress) {
            _context2.n = 2;
            break;
          }
          throw new Error("Missing wallet address");
        case 2:
          if (!(startStep <= 1)) {
            _context2.n = 5;
            break;
          }
          onStep && onStep({
            step: 1,
            state: "loading",
            message: "Dang tao Trading Account..."
          });
          _context2.n = 3;
          return postJson("/api/onboard/bot-key", {
            wallet_address: walletAddress
          });
        case 3:
          bot = _context2.v;
          _context2.n = 4;
          return postJson("/api/onboard/progress", {
            wallet_address: walletAddress,
            step: 1,
            subaccount_address: bot.bot_key_address || walletAddress,
            tx_hash: "tx_create_subaccount_" + Date.now()
          });
        case 4:
          onStep && onStep({
            step: 1,
            state: "success",
            message: "Tao Trading Account thanh cong."
          });
        case 5:
          if (!(startStep <= 2)) {
            _context2.n = 7;
            break;
          }
          onStep && onStep({
            step: 2,
            state: "loading",
            message: "Dang approve Builder Fee..."
          });
          _context2.n = 6;
          return postJson("/api/onboard/progress", {
            wallet_address: walletAddress,
            step: 2,
            tx_hash: "tx_approve_builder_" + Date.now(),
            builder_address: builderAddress || ""
          });
        case 6:
          onStep && onStep({
            step: 2,
            state: "success",
            message: "Approve Builder Fee thanh cong."
          });
        case 7:
          if (!(startStep <= 3)) {
            _context2.n = 9;
            break;
          }
          onStep && onStep({
            step: 3,
            state: "loading",
            message: "Dang uy quyen Bot Trading..."
          });
          _context2.n = 8;
          return postJson("/api/onboard/progress", {
            wallet_address: walletAddress,
            step: 3,
            tx_hash: "tx_delegate_bot_" + Date.now()
          });
        case 8:
          onStep && onStep({
            step: 3,
            state: "success",
            message: "Uy quyen Bot Trading thanh cong."
          });
        case 9:
          onSuccess && onSuccess();
          _context2.n = 11;
          break;
        case 10:
          _context2.p = 10;
          _t = _context2.v;
          onError && onError(_t);
        case 11:
          return _context2.a(2);
      }
    }, _callee2, null, [[1, 10]]);
  }));
  return _runOnboarding.apply(this, arguments);
}

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./resources/js/onboarding.js ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _decibel_onboarding_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decibel-onboarding.js */ "./resources/js/decibel-onboarding.js");
var _stepsEl$dataset$init, _document$querySelect;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }


// ===== DOM =====
var stepsEl = document.getElementById("onboarding-steps");
var btnStart = document.getElementById("btn-start-onboarding");
var btnRetry = document.getElementById("btn-retry-onboarding");
var statusText = document.getElementById("onboarding-status-text");
var errorText = document.getElementById("onboarding-error-text");

// ===== DATA từ Blade =====
var initialStep = parseInt((_stepsEl$dataset$init = stepsEl.dataset.initialStep) !== null && _stepsEl$dataset$init !== void 0 ? _stepsEl$dataset$init : "0");
var isOnboarded = stepsEl.dataset.isOnboarded === "1";
var walletAddress = stepsEl.dataset.walletAddress;
var builderAddress = (_document$querySelect = document.querySelector('meta[name="builder-address"]')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.content;

// ===== INIT =====
window.addEventListener("load", function () {
  // Nếu đã onboarded redirect luôn
  if (isOnboarded) {
    window.location.href = "/";
    return;
  }

  // Highlight bước đã xong trước đó
  for (var i = 1; i <= initialStep; i++) {
    setStepState(i, "success");
  }
  btnStart.addEventListener("click", startOnboarding);
  btnRetry.addEventListener("click", startOnboarding);
});

// ===== START ONBOARDING =====
function startOnboarding() {
  return _startOnboarding.apply(this, arguments);
}
function _startOnboarding() {
  _startOnboarding = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var i, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          btnStart.disabled = true;
          btnRetry.classList.add("d-none");
          errorText.classList.add("d-none");
          errorText.textContent = "";

          // Reset step chưa xong về pending
          for (i = initialStep + 1; i <= 3; i++) {
            setStepState(i, "pending");
          }
          console.log("walletAddress:", walletAddress);
          console.log("builderAddress:", builderAddress);
          console.log("initialStep:", initialStep);
          console.log(document.getElementById("onboarding-steps").dataset);
          _context.p = 1;
          _context.n = 2;
          return (0,_decibel_onboarding_js__WEBPACK_IMPORTED_MODULE_0__.runOnboarding)({
            walletAddress: walletAddress,
            builderAddress: builderAddress,
            onStep: function onStep(step, msg) {
              statusText.textContent = msg;
              if (step === 0) return;
              if (step > 1) setStepState(step - 1, "success");
              setStepState(step, "loading");
            },
            onSuccess: function onSuccess() {
              var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                subaccountAddress = _ref.subaccountAddress,
                txHashes = _ref.txHashes;
              for (var _i = 1; _i <= 3; _i++) {
                setStepState(_i, "success");
              }
              statusText.textContent = "✅ Thiết lập hoàn tất! Đang chuyển hướng...";
              btnStart.classList.add("d-none");
              console.log("Subaccount:", subaccountAddress);
              console.log("Transactions:", txHashes);
              setTimeout(function () {
                window.location.href = "/";
              }, 1500);
            },
            onError: function onError(err) {
              errorText.textContent = err.message;
              errorText.classList.remove("d-none");
              statusText.textContent = "Đã xảy ra lỗi. Vui lòng thử lại.";
              btnStart.disabled = false;
              btnRetry.classList.remove("d-none");
            }
          });
        case 2:
          _context.n = 4;
          break;
        case 3:
          _context.p = 3;
          _t = _context.v;
        case 4:
          return _context.a(2);
      }
    }, _callee, null, [[1, 3]]);
  }));
  return _startOnboarding.apply(this, arguments);
}
function setStepState(step, state) {
  var icon = document.getElementById("step-icon-".concat(step));
  var label = document.getElementById("step-label-".concat(step));
  var status = document.getElementById("step-status-".concat(step));
  var item = document.querySelector(".step-item[data-step=\"".concat(step, "\"]"));
  if (!icon || !label || !status || !item) {
    console.warn("Step ".concat(step, " not found in DOM"));
    return;
  }
  item.classList.remove("border-primary", "border-success", "border-danger");
  icon.className = "step-icon";
  label.className = "step-label";
  switch (state) {
    case "pending":
      icon.innerHTML = '<i class="fi fi-rr-circle"></i>';
      icon.classList.add("text-muted");
      label.classList.add("text-secondary");
      status.textContent = "pending";
      status.className = "small text-muted";
      break;
    case "loading":
      icon.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div>';
      label.classList.add("text-primary", "fw-semibold");
      status.textContent = "đang xử lý...";
      status.className = "small text-primary";
      item.classList.add("border-primary");
      break;
    case "success":
      icon.innerHTML = '<i class="fi fi-rr-check-circle text-success"></i>';
      label.classList.add("text-success", "fw-semibold");
      status.textContent = "hoàn tất";
      status.className = "small text-success";
      item.classList.add("border-success");
      break;
    case "error":
      icon.innerHTML = '<i class="fi fi-rr-cross-circle text-danger"></i>';
      label.classList.add("text-danger");
      status.textContent = "lỗi";
      status.className = "small text-danger";
      item.classList.add("border-danger");
      break;
  }
}
})();

/******/ })()
;