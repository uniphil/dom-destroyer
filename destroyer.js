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
  mask.style.transition = 'all 0.1s';

  var current_target;
  var soft_disarm = false;

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
    if (soft_disarm) return;
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
    if (soft_disarm) return;
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    if (!current_target) return;
    var rect = current_target.getBoundingClientRect();

    var replacement = document.createElement('div');
    replacement.style.background = 'hsl(350, 50%, 50%)';
    replacement.style.height = rect.height + 'px';
    replacement.style.width = rect.width + 'px';
    replacement.style.opacity = '1'
    replacement.style.transition = 'all 0.2s';

    var target_style = getComputedStyle(current_target);
    if (target_style.position !== 'static') {
      replacement.style.position = target_style.position;
      replacement.style.left = target_style.left;
      replacement.style.top = target_style.top;
    }
    current_target.replaceWith(replacement);

    // need the next-next frame to ensure the transition happens :(
    requestAnimationFrame(() => requestAnimationFrame(() => {
      replacement.style.height = '0px';
      replacement.style.width = '0px';
      replacement.style.opacity = '0.5';
    }));

    setTimeout(() => {
      replacement.remove();
      soft_disarm = false;
      mask.style.opacity = '1';
    }, 200);

    soft_disarm = true;
    mask.style.opacity = '0';
    lock_off();
  };

  var maybe_disarm = function keydown(event) {
    if (event.keyCode === 27) {  // ESC
      disarm();
    }
  };

  var disarm = function disarm() {
    mask.remove();
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
