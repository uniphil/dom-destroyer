
chrome.browserAction.onClicked.addListener(function(tab) {
  // chrome.browserAction.setIcon({
  //   path: "active_destroy_128.png"
  // });
  chrome.tabs.executeScript({
    file: 'destroyer.js'
  });
});
