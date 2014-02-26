(function() {
  if (window.show_mercy) {
    window.show_mercy();
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
    el.parentNode.removeChild(el);
    mask.style.height = '0';
    mask.style.width = '0';
  };
  var maybe_show_mercy = function keydown(event) {
    if (event.keyCode === 27)
      stop_destroying();
  };

  var show_mercy = function show_mercy() {
    document.body.removeChild(mask);
    document.removeEventListener('mouseover', change_target);
    document.removeEventListener('click', destroy);
    document.removeEventListener('keydown', maybe_show_mercy);

    window.show_mercy = null;
  };

  var arm_destroyer = function arm_destroyer() {
    document.body.appendChild(mask);
    document.addEventListener('mouseover', change_target);
    document.addEventListener('click', destroy);
    document.addEventListener('keydown', maybe_show_mercy);

    window.show_mercy = show_mercy;
  };

  arm_destroyer();
})();
