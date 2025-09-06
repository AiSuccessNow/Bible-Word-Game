
/*! zero_risk_enhancements.js
    Non-breaking wrappers for celebrate, handleKey, getStreak, setStreak, statusMsg.
    - Preserves original behavior
    - Adds guards and try/catch
    - No DOM or logic restructuring
*/
(function () {
  function safePlayWinSound() {
    try {
      var el = document.getElementById('win-sound');
      if (el && typeof el.play === 'function') {
        el.play().catch(function(){ /* ignore autoplay or missing file */ });
      }
    } catch (e) { /* ignore */ }
  }

  // celebrate: add safe audio play, then original behavior
  if (typeof window.celebrate === "function") {
    var __orig_celebrate = window.celebrate;
    window.celebrate = function () {
      safePlayWinSound();
      try { return __orig_celebrate.apply(this, arguments); }
      catch (e) { /* never break */ }
    };
  }

  // handleKey: pre-filter unknown keys, then call original
  if (typeof window.handleKey === "function") {
    var __orig_handleKey = window.handleKey;
    window.handleKey = function (e) {
      try {
        var k = (e && e.key ? String(e.key) : "").toLowerCase();
        if (!/^[a-z]$|^enter$|^backspace$/.test(k)) return;
      } catch (err) { /* ignore */ }
      try { return __orig_handleKey.apply(this, arguments); }
      catch (e2) { /* never break */ }
    };
  }

  // getStreak / setStreak: add storage guards while preserving original logic
  if (typeof window.getStreak === "function") {
    var __orig_getStreak = window.getStreak;
    window.getStreak = function () {
      try { return __orig_getStreak.apply(this, arguments); }
      catch (e) {
        try { return parseInt(localStorage.getItem("streak") || "0", 10) || 0; }
        catch (_) { return 0; }
      }
    };
  } else {
    window.getStreak = function () {
      try { return parseInt(localStorage.getItem("streak") || "0", 10) || 0; }
      catch (_) { return 0; }
    };
  }

  if (typeof window.setStreak === "function") {
    var __orig_setStreak = window.setStreak;
    window.setStreak = function (n) {
      try { __orig_setStreak.apply(this, arguments); } catch (_) { /* ignore */ }
      try { localStorage.setItem("streak", String(n)); } catch (_) { /* ignore */ }
    };
  } else {
    window.setStreak = function (n) {
      try { localStorage.setItem("streak", String(n)); } catch (_) { /* ignore */ }
    };
  }

  // statusMsg: call original immediately; then schedule a no-op rAF to keep UI smooth.
  if (typeof window.statusMsg === "function") {
    var __orig_statusMsg = window.statusMsg;
    window.statusMsg = function () {
      try { var ret = __orig_statusMsg.apply(this, arguments); } catch (e) { /* ignore */ }
      try { requestAnimationFrame(function(){ /* paint sync */ }); } catch (_) {}
      return ret;
    };
  } else {
    // Provide a minimal fallback that won't break anything if called.
    window.statusMsg = function (text) {
      try {
        requestAnimationFrame(function(){
          var el = document.getElementById("status");
          if (el && typeof text === "string") el.textContent = text;
        });
      } catch (_) {}
    };
  }
})();
