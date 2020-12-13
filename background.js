const toggle = () =>
  chrome.tabs.executeScript({ file: 'destroyer.js' });

chrome.browserAction.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener(toggle);

chrome.runtime.onMessage.addListener(msg => {
  const path = `${msg.armed ? 'active_' : ''}destroy_128.png`;
  chrome.browserAction.setIcon({ path });
});
