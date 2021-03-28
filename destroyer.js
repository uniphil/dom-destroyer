"use strict";
(function() {
  if (window.__dom_destroyer_disarm) {
    window.__dom_destroyer_disarm();
    return;
  }

  var mask = document.createElement('div');
  mask.style.boxSizing = 'border-box';
  mask.style.pointerEvents = 'none';
  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.height = '0';
  mask.style.width = '0';
  mask.style.border = '2px dashed hsla(350, 50%, 50%, 0.5)'
  mask.style.background = 'radial-gradient(circle, hsla(350, 50%, 80%, 0) 25%, hsla(350, 50%, 50%, 0.25))';
  mask.style.zIndex = '9999999';
  mask.style.transition = 'top 0.1s, left 0.1s, width 0.1s, height 0.1s';

  var current_target;

  var lock_on = function lock_on(el, rect) {
    current_target = el;
    rect = rect || el.getBoundingClientRect();
    mask.style.width = rect.width + 'px';
    mask.style.left =  rect.left + 'px';
    mask.style.height = rect.height + 'px';
    mask.style.top = rect.top + 'px';
    mask.style.display = 'block';
  }

  var _rafref;
  var follow = function() {
    cancelAnimationFrame(_rafref);
    _rafref = requestAnimationFrame(() => {
      if (current_target) lock_on(current_target);
    })
  }

  var lock_off = function lock_off() {
    current_target = null;
    mask.style.display = 'none';
  }

  var change_target = function change_target(event) {
    var el = event.target;
    var rect = el.getBoundingClientRect();
    while (el.parentNode && el.parentNode.getBoundingClientRect) {
      var parentRect = el.parentNode.getBoundingClientRect();
      if (rect.top    !== parentRect.top    ||
          rect.right  !== parentRect.right  ||
          rect.bottom !== parentRect.bottom ||
          rect.left   !== parentRect.left
      ) break;
      el = el.parentNode;
      rect = parentRect;
    }
    lock_on(el, rect);
  };

  var destroy = function destroy(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    if (!current_target) return;
    current_target.parentNode.removeChild(current_target);
    lock_off();
  };

  var maybe_disarm = function keydown(event) {
    if (event.keyCode === 27) {  // ESC
      disarm();
    }
  };

  var disarm = function disarm() {
    document.body.removeChild(mask);
    document.removeEventListener('mouseover', change_target);
    document.removeEventListener('click', destroy, true);
    document.removeEventListener('keydown', maybe_disarm);
    document.addEventListener('scroll', follow);
    window.removeEventListener('blur', disarm);

    chrome.runtime.sendMessage({ armed: false });

    window.__dom_destroyer_disarm = null;
  };

  var arm_destroyer = function arm_destroyer() {
    document.body.appendChild(mask);
    document.addEventListener('mouseover', change_target);
    document.addEventListener('click', destroy, true);
    document.addEventListener('keydown', maybe_disarm);
    document.addEventListener('scroll', follow);
    window.addEventListener('blur', disarm);

    chrome.runtime.sendMessage({ armed: true });

    window.__dom_destroyer_disarm = disarm;
  };

  arm_destroyer();
})();
