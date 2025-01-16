"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/sound-play/build/main.js
var require_main = __commonJS({
  "node_modules/sound-play/build/main.js"(exports2, module2) {
    module2.exports = function(e) {
      var r = {};
      function t(n) {
        if (r[n])
          return r[n].exports;
        var o = r[n] = { i: n, l: false, exports: {} };
        return e[n].call(o.exports, o, o.exports, t), o.l = true, o.exports;
      }
      return t.m = e, t.c = r, t.d = function(e2, r2, n) {
        t.o(e2, r2) || Object.defineProperty(e2, r2, { enumerable: true, get: n });
      }, t.r = function(e2) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, t.t = function(e2, r2) {
        if (1 & r2 && (e2 = t(e2)), 8 & r2)
          return e2;
        if (4 & r2 && "object" == typeof e2 && e2 && e2.__esModule)
          return e2;
        var n = /* @__PURE__ */ Object.create(null);
        if (t.r(n), Object.defineProperty(n, "default", { enumerable: true, value: e2 }), 2 & r2 && "string" != typeof e2)
          for (var o in e2)
            t.d(n, o, function(r3) {
              return e2[r3];
            }.bind(null, o));
        return n;
      }, t.n = function(e2) {
        var r2 = e2 && e2.__esModule ? function() {
          return e2.default;
        } : function() {
          return e2;
        };
        return t.d(r2, "a", r2), r2;
      }, t.o = function(e2, r2) {
        return Object.prototype.hasOwnProperty.call(e2, r2);
      }, t.p = "", t(t.s = 0);
    }([function(e, r, t) {
      const { exec: n } = t(1), o = t(2).promisify(n);
      e.exports = { play: async (e2, r2 = 0.5) => {
        const t2 = "darwin" === process.platform ? Math.min(2, 2 * r2) : r2, n2 = "darwin" === process.platform ? ((e3, r3) => `afplay "${e3}" -v ${r3}`)(e2, t2) : ((e3, r3) => `powershell -c Add-Type -AssemblyName presentationCore; $player = New-Object system.windows.media.mediaplayer; ${((e4) => `$player.open('${e4}');`)(e3)} $player.Volume = ${r3}; $player.Play(); Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`)(e2, t2);
        try {
          await o(n2);
        } catch (e3) {
          throw e3;
        }
      } };
    }, function(e, r) {
      e.exports = require("child_process");
    }, function(e, r) {
      e.exports = require("util");
    }]);
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var import_fs = require("fs");
var vscode = __toESM(require("vscode"));
var sound = require_main();
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("what-the-beep.beep", async (args) => {
      const filepath = args?.file ?? vscode.Uri.joinPath(context.extensionUri, "media", "success.wav").fsPath;
      console.log(`[What-the-beep] Playing audio file ${filepath}`);
      if (!(0, import_fs.existsSync)(filepath)) {
        vscode.window.showErrorMessage(`Audio file not found: ${filepath}`);
        return;
      }
      ;
      if (filepath.includes(`'`) || filepath.includes('"')) {
        vscode.window.showErrorMessage(`Audio file path must not contain single or double quote characters`);
        return;
      }
      try {
        await sound.play(filepath).then(
          void 0,
          (error) => {
            vscode.window.showErrorMessage(`Failed to play audio file: ${error}`);
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Unexpected audio file error: ${error}`);
      }
      console.log(`[What-the-beep] Successfully played audio file ${filepath}`);
    })
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
