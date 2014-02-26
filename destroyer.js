(function() {

  var listeners = [];
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
    mask.style.height = '0';
    mask.style.width = '0';
  };
  var escape = function() {
    document.body.removeChild(mask);
  };

  window.start_destroying = function start_destroying() {
    document.querySelector('body').appendChild(mask);
    listeners.push(document.addEventListener('mouseover', mouseover));
    listeners.push(document.addEventListener('click', destroy));
    listeners.push(document.addEventListener('keydown', function(event) {
      if (event.keyCode === 27) {
        escape();
      }
    }));
  };

  start_destroying();
})();
