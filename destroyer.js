"use strict";
(function() {
  if (window.__dom_destroyer_disarm) {
    window.__dom_destroyer_disarm();
    return;
  }

  var mask = document.createElement('div');
  mask.style.pointerEvents = 'none';
  mask.style.position = 'absolute';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.height = '0';
  mask.style.width = '0';
  mask.style.background = 'rgba(127, 0, 0, 0.5)';
  mask.style.boxShadow = '0 0 8px red';
  mask.style.zIndex = '9999999';

  var page_offset = function page_offset(el) {
    var left = 0;
    var top = 0;
    while(el) {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return {left: left, top: top};
  };

  var change_target = function change_target(event) {
    var el = event.target;
    var offset = page_offset(el);
    mask.style.width = el.offsetWidth + 'px';
    mask.style.left = offset.left + 'px';
    mask.style.height = el.offsetHeight + 'px';
    mask.style.top = offset.top + 'px';
  };
  var destroy = function destroy(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    var el = event.target;
    if (!el) return;
    el.parentNode.removeChild(el);
    mask.style.height = '0';
    mask.style.width = '0';
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
    window.removeEventListener('blur', disarm);

    chrome.runtime.sendMessage({ armed: false });

    window.__dom_destroyer_disarm = null;
  };

  var arm_destroyer = function arm_destroyer() {
    document.body.appendChild(mask);
    document.addEventListener('mouseover', change_target);
    document.addEventListener('click', destroy, true);
    document.addEventListener('keydown', maybe_disarm);
    window.addEventListener('blur', disarm);

    chrome.runtime.sendMessage({ armed: true });

    window.__dom_destroyer_disarm = disarm;
  };

  arm_destroyer();
})();
