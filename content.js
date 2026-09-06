(function () {
  'use strict';

  var VERSION = '11.0.0';
  var STYLE_ID = 'aak-modern-style';
  var REMOVED = new WeakSet();
  var SELECTORS = [
    '[id*="anti-adblock" i]',
    '[class*="anti-adblock" i]',
    '[id*="adblock-message" i]',
    '[class*="adblock-message" i]',
    '[id*="blockadblock" i]',
    '[class*="blockadblock" i]',
    '[id*="fuckadblock" i]',
    '[class*="fuckadblock" i]',
    '[data-adblock]',
    '[data-adblocker]',
    '[data-adblock-detected]'
  ];
  var TEXT_RE = /(?:ad\s*block(?:er|ing)?|anti[-_ ]?adblock|disable\s+(?:your\s+)?ad\s*block|turn\s+off\s+(?:your\s+)?ad\s*block|whitelist\s+(?:this\s+)?site|広告ブロック|广告拦截)/i;
  var ACTION_RE = /(?:disable|turn\s+off|deactivate|whitelist|allow|remove|detected|please\s+(?:support|enable))/i;

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = SELECTORS.join(',\n') + '{display:none!important;visibility:hidden!important;pointer-events:none!important;}';
    (document.head || document.documentElement).appendChild(style);
  }

  function textOf(node) {
    if (!node || !node.textContent) return '';
    return node.textContent.replace(/\s+/g, ' ').trim().slice(0, 1200);
  }

  function overlayLike(node) {
    if (!node || node.nodeType !== 1) return false;
    var style = window.getComputedStyle(node);
    var rect = node.getBoundingClientRect();
    var position = style.position;
    var zIndex = parseInt(style.zIndex, 10);
    var role = (node.getAttribute('role') || '').toLowerCase();
    var viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
    var area = Math.max(0, rect.width * rect.height);
    return role === 'dialog' || position === 'fixed' || position === 'sticky' ||
      (!isNaN(zIndex) && zIndex >= 1000) || area / viewportArea > 0.28;
  }

  function likelyAntiAdblock(node) {
    var text = textOf(node);
    if (!TEXT_RE.test(text) || !ACTION_RE.test(text)) return false;
    return overlayLike(node) || node.matches('[role="dialog"], [aria-modal="true"]');
  }

  function hide(node) {
    if (!node || REMOVED.has(node)) return;
    REMOVED.add(node);
    node.setAttribute('data-aak-hidden', VERSION);
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
  }

  function scan(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 9) return;
    try {
      SELECTORS.forEach(function (selector) {
        root.querySelectorAll(selector).forEach(hide);
      });
      if (root.nodeType === 1 && likelyAntiAdblock(root)) hide(root);
      root.querySelectorAll('[role="dialog"], [aria-modal="true"], body > div, body > section').forEach(function (node) {
        if (likelyAntiAdblock(node)) hide(node);
      });
    } catch (error) {
      // Some pages replace DOM APIs or expose invalid selector contexts.
    }
  }

  function unlockScroll() {
    var body = document.body;
    var html = document.documentElement;
    if (!body) return;
    [body, html].forEach(function (node) {
      if (!node) return;
      var inline = node.getAttribute('style') || '';
      if (/overflow\s*:\s*hidden/i.test(inline)) {
        node.style.setProperty('overflow', 'auto', 'important');
      }
      if (/position\s*:\s*fixed/i.test(inline) && node === body) {
        node.style.removeProperty('position');
      }
    });
  }

  function start() {
    addStyle();
    scan(document);
    unlockScroll();

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) scan(node);
        });
      });
      unlockScroll();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // A delayed scan catches dialogs created after consent, route changes, or
    // framework hydration without polling the whole document continuously.
    [800, 2000, 5000].forEach(function (delay) {
      window.setTimeout(function () { scan(document); unlockScroll(); }, delay);
    });
  }

  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
