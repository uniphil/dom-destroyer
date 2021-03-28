"use strict";
(function() {
  if (window.__dom_destroyer_disarm) {
    window.__dom_destroyer_disarm();
    return;
  }

  var mask = document.createElement('div');
  mask.style.boxSizing = 'border-box';
  mask.style.pointerEvents = 'none';
  mask.style.position = 'absolute';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.height = '0';
  mask.style.width = '0';
  mask.style.border = '2px dashed hsla(350, 50%, 50%, 0.5)'
  mask.style.background = 'radial-gradient(circle, hsla(350, 50%, 80%, 0) 25%, hsla(350, 50%, 50%, 0.25))';
  mask.style.zIndex = '9999999';

  var stack_bottom = function stack_bottom(el) {
    // walk up the DOM while parent nodes are exactly the same size & place
    while (el.parentNode) {
      if (el.clientLeft   !== 0 ||
          el.clientTop    !== 0 ||
          el.offsetLeft   !== 0 ||
          el.offsetTop    !== 0 ||
          el.offsetWidth  !== el.parentNode.offsetWidth ||
          el.offsetHeight !== el.parentNode.offsetHeight
      ) break;
      el = el.parentNode;
    }
    return el;
  }

  var page_offset = function page_offset(el) {
    var left = -el.clientLeft;
    var top = -el.clientTop;
    while(el) {
      left += el.offsetLeft + el.clientLeft;
      top += el.offsetTop + el.clientTop;
      el = el.offsetParent;
    }
    return {left: left, top: top};
  };

  var change_target = function change_target(event) {
    var el = stack_bottom(event.target);
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
    var el = stack_bottom(event.target);
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
