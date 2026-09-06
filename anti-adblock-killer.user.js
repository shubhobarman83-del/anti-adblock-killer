// ==UserScript==
// @name Anti-Adblock Killer | shubhobarman83-del Fork
// @namespace https://github.com/shubhobarman83-del/anti-adblock-killer
// @description Helps you keep your Ad-Blocker active, when you visit a website and it asks you to disable.
// @author shubhobarman83-del
// @version 11.0.0
// @encoding utf-8
// @license https://creativecommons.org/licenses/by-sa/4.0/
// @icon https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer-icon.png
// @homepage https://github.com/shubhobarman83-del/anti-adblock-killer
// @supportURL https://github.com/shubhobarman83-del/anti-adblock-killer/issues
// @updateURL https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer.user.js
// @downloadURL https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer.user.js
// @include http://*/*
// @include https://*/*
// @grant unsafeWindow
// @grant GM_addStyle
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_xmlhttpRequest
// @grant GM_registerMenuCommand
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_getResourceText
// @grant GM_getResourceURL
// @grant GM_log
// @grant GM_openInTab
// @grant GM_setClipboard
// @grant GM_info
// @grant GM_getMetadata
// @run-at document-start
// @connect *
// ==/UserScript==
/*jshint evil:true newcap:false*/
/*global unsafeWindow, GM_addStyle, GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_registerMenuCommand, GM_deleteValue, GM_listValues, GM_getResourceText, GM_getResourceURL, GM_log, GM_openInTab, GM_setClipboard, GM_info, GM_getMetadata, $, document, console, location, setInterval, setTimeout, clearInterval*/
/*=====================================================
  Anti-Adblock Killer Fork
======================================================

  This is a fork of the original Anti-Adblock Killer project
  maintained at: https://github.com/reek/anti-adblock-killer
  
  Current Fork: https://github.com/shubhobarman83-del/anti-adblock-killer
  Fork Author: shubhobarman83-del
  
  Original Project Credits:
  Author: Reek | http://reeksite.com/
  
  Mirrors:
  - Github: https://github.com/reek/anti-adblock-killer
  - Greasyfork: https://greasyfork.org
  - OpenUserJS: https://openuserjs.org
  
  Documentation:
  - Greasemonkey: http://tinyurl.com/yeefnj5
  - Scriptish: http://tinyurl.com/cnd9nkd
  - Tampermonkey: http://tinyurl.com/pdytfde
  - Violentmonkey: http://tinyurl.com/n34wn6j
  - NinjaKit: http://tinyurl.com/pkkm9ug

=======================================================
  Script
======================================================*/

(function (window) {
  "use strict";

  var Aak = {
    name : 'Anti-Adblock Killer',
    version : '11.0.0',
    scriptid : 'gJWEp0vB',
    homeURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer',
    changelogURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer/releases',
    featuresURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer#features',
    reportURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer/issues',
    settingsURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer#settings',
    twitterURL : 'https://github.com/shubhobarman83-del',
    downloadURL : 'https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer.user.js',
    subscribeURL : 'https://github.com/shubhobarman83-del/anti-adblock-killer#filterlist',
    listURL : "https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer-filters.txt",
    iconURL : 'https://raw.githubusercontent.com/shubhobarman83-del/anti-adblock-killer/master/anti-adblock-killer-icon.png',
    imgBait : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAGklEQVR42mNg0GAYBaNgFIyCUTAKRsEoQAYATN8AKYNZ/x4AAAAASUVORK5CYII=',
    initialize : function () {
      Aak.registerSettings(); // registering your settings.
      Aak.registerConsole(); // registering customized console.
      Aak.registerCommands(); // add commands to menu
      Aak.checkUpdate(true); // check if AakScript is up to date.
      Aak.checkList(); // check if AakList is enabled.
      Aak.blockDetect(); // detect and kill anti-adblocks.
    },
    aabs : {},
    opts : {},
    options : {
      autoPlay : {
        group : 'general',
        type : 'checkbox',
        value : false,
        label : 'Play video automatically. *',
        info : ''
      },
      videoHD : {
        group : 'general',
        type : 'checkbox',
        value : false,
        label : 'Play video in HD quality. **',
        info : ''
      },
      forceVLC : {
        group : 'general',
        type : 'checkbox',
        value : false,
        label : 'Play video with VLC plugin. *',
        info : ''
      },
      checkList : {
        group : 'general',
        type : 'checkbox',
        value : true,
        label : 'Check AakList subscription.',
        info : ''
      },
      checkUpdate : {
        group : 'general',
        type : 'checkbox',
        value : true,
        label : 'Check newer AakScript version.',
        info : ''
      },
      debug : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Enable Logs.',
        info : ''
      },
      logInsertedNodes : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log inserted nodes.',
        info : ''
      },
      logRemovedNodes : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log removed nodes.',
        info : ''
      },
      logExcluded : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log excludes domains.',
        info : ''
      },
      logXhr : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log HTTP requests',
        info : ''
      },
      logPlayer : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log player instances.',
        info : ''
      },
      logInterceptedScripts : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log intercepted scripts.',
        info : ''
      },
      logDetected : {
        group : 'debug',
        type : 'checkbox',
        value : false,
        label : 'Log detected anti-adblocks.',
        info : ''
      }
    },
    registerSettings : function () {
      for (var optName in Aak.options) {
        if (Aak.options.hasOwnProperty(optName))
          Aak.opts[optName] = Aak.getValue(optName) !== null ? Aak.getValue(optName) : Aak.options[optName].value;
      }
    },
    commands : [{
        caption : 'Homepage',
        execute : function () {
          Aak.go(Aak.homeURL);
        }
      }, {
        caption : 'Settings',
        execute : function () {
          Aak.go(Aak.settingsURL);
        }
      }, {
        caption : 'Report Issue',
        execute : function () {
          Aak.go(Aak.reportURL);
        }
      }, {
        caption : 'Update',
        execute : function () {
          Aak.checkUpdate();
        }
      }
    ],
    addCommands : function (cmd) {
      if (Aak.useGM && Aak.isTopframe && typeof GM_registerMenuCommand != 'undefined') {
        GM_registerMenuCommand([Aak.name, Aak.getVersion(), cmd.caption].join(' '), cmd.execute);
      }
    },
    registerCommands : function () {
      Aak.ready(function () {
        // Scriptish
        // note: No menu command is created when the user script is run in a iframe window.
        // doc: http://tinyurl.com/kvvv7yt
        Aak.commands.forEach(function (cmd) {
          Aak.addCommands(cmd);
        });
      });
    },
    registerConsole : function () {
      this.log = Aak.opts.debug ? console.log.bind(console) : function () {};
      this.info = Aak.opts.debug ? console.info.bind(console) : function () {};
      this.error = Aak.opts.debug ? console.error.bind(console) : function () {};
      this.warn = Aak.opts.debug ? console.warn.bind(console) : function () {};
    },
    isTopframe : (window.parent == window.self),
    uw : typeof unsafeWindow != 'undefined' ? unsafeWindow : window,
    useGM : typeof GM_getValue != 'undefined',
    apiGM : function () {
      if (Aak.isTopframe) {
        // GM API - http://tinyurl.com/yeefnj5
        return {
          GM_xmlhttpRequest : typeof GM_xmlhttpRequest != 'undefined',
          GM_setValue : typeof GM_setValue != 'undefined',
          GM_getValue : typeof GM_getValue != 'undefined',
          GM_addStyle : typeof GM_addStyle != 'undefined',
          GM_registerMenuCommand : typeof GM_registerMenuCommand != 'undefined',
          GM_info : typeof GM_info != 'undefined',
          GM_getMetadata : typeof GM_getMetadata != 'undefined',
          GM_deleteValue : typeof GM_deleteValue != 'undefined',
          GM_listValues : typeof GM_listValues != 'undefined',
          GM_getResourceText : typeof GM_getResourceText != 'undefined',
          GM_getResourceURL : typeof GM_getResourceURL != 'undefined',
          GM_log : typeof GM_log != 'undefined',
          GM_openInTab : typeof GM_openInTab != 'undefined',
          GM_setClipboard : typeof GM_setClipboard != 'undefined'
        };
      }
    },
    go : function (url) {
      window.location.href = url;
    },
    refresh : function () {
      window.location.href = window.location.href;
    },
    reload : function () {
      window.location.reload(true);
    },
    contains : function (string, search) {
      return string.indexOf(search) != -1;
    },
    blockDetect : function () {
      // Main function to block anti-adblock detection
      Aak.fakeFuckAdBlock('fuckAdBlock', 'FuckAdBlock');
    },
    getValue : function (name) {
      if (typeof GM_listValues !== "undefined" && !name) {
        var list = {};
        var vals = GM_listValues();
        for (var i in vals) {
          if (vals.hasOwnProperty(i))
            list[vals[i]] = GM_getValue(vals[i]);
        }
        return list;
      } else if (typeof GM_getValue !== "undefined" && typeof GM_getValue(name) !== "undefined") {
        return GM_getValue(name);
      } else {
        return null;
      }
    },
    setValue : function (name, value) {
      if (typeof GM_setValue !== "undefined") {
        GM_setValue(name, value);
      }
    },
    fakeFuckAdBlock : function (instanceName, className) {
      // inject fake fuckadblock
      Aak.addScript(Aak.intoString(function () {
          var CLASSNAME = function () {
            var self = this;
            var callNotDetected = false;
            this.debug = {
              set : function () {
                return self;
              },
              get : function () {
                return false;
              }
            };
            this.onDetected = function (callback) {
              this.on(true, callback);
              return this;
            };
            this.onNotDetected = function (callback) {
              this.on(false, callback);
              return this;
            };
            this.on = function (detected, callback) {
              if (!detected) {
                callNotDetected = callback;
                setTimeout(callback, 1);
              }
              console.info(['AntiAdbKiller', location.host, 'FuckAdBlock']);
              return this;
            };
            this.setOption = function () {
              return this;
            };
            this.options = {
              set : function () {
                return this;
              },
              get : function () {
                return this;
              }
            };
            this.check = function () {
              if (callNotDetected)
                callNotDetected();
            };
            this.emitEvent = function () {
              return this;
            };
            this.clearEvent = function () {};
          };

          Object.defineProperties(window, {
            CLASSNAME : {
              value : CLASSNAME,
              writable : false
            }
          });

          Object.defineProperties(window, {
            INSTANCENAME : {
              value : new CLASSNAME(),
              writable : false
            }
          });

        }).replace(/INSTANCENAME/g, instanceName || 'fuckAdBlock')
        .replace(/CLASSNAME/g, className || 'FuckAdBlock'));
    },
    addScript : function (source, body) {
      var script = document.createElement('script');
      script.type = "text/javascript";
      script.innerHTML = (typeof source === 'function') ? Aak.intoString(source) : source.toString();
      if (body) {
        document.body.appendChild(script);
      } else {
        document.head.appendChild(script);
      }
      script.remove();
    },
    intoString : function (a) {
      if (typeof a === 'function') {
        var str = a.toString();
        var first = str.indexOf("{") + 1;
        var last = str.lastIndexOf("}");
        return str.substr(first, last - first).trim();
      } else if (typeof entry === 'object') {
        return JSON.stringify(a);
      } else { // array or string
        return a.toString();
      }
    },
    ready : function (callback) {
      Aak.onEvent(window, 'load', callback);
    },
    onEvent : function (element, type, listener, bubbles) {
      if (window.addEventListener) { // For all major browsers, except IE 8 and earlier
        (element || window).addEventListener(type, listener, bubbles || false);
      } else { // For IE 8 and earlier versions
        (element || window).attachEvent('on' + type, listener);
      }
      return arguments;
    }
  };

  // Initialize the script
  Aak.initialize();

})(window);
