(function() {
  if (window.__global_dom_destroyer_active)
    return;

  window.__global_dom_destroyer_active = true;

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

  var mouseover = function(event) {
    var el = event.target;
    var offset = page_offset(el);
    mask.style.width = el.offsetWidth + 'px';
    mask.style.left = offset.left + 'px';
    mask.style.height = el.offsetHeight + 'px';
    mask.style.top = offset.top + 'px';
  };
  var destroy = function(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    var el = event.target;
    el.parentNode.removeChild(el);
  };
  var keydown = function(event) {
    if (event.keyCode === 27)
      stop_destroying();
  };

  var stop_destroying = function() {
    document.body.removeChild(mask);
    document.removeEventListener('mouseover', mouseover);
    document.removeEventListener('click', destroy);
    document.removeEventListener('keydown', keydown);

    window.__global_dom_destroyer_active = false;
  };

  var start_destroying = function start_destroying() {
    document.body.appendChild(mask);
    document.addEventListener('mouseover', mouseover);
    document.addEventListener('click', destroy);
    document.addEventListener('keydown', keydown);
  };

  start_destroying();
})();
