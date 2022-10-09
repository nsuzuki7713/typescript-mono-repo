let body = document.querySelector("body");
let addElement = document.createElement('h1');
addElement.textContent = "HELLO WORLD";
body.prepend(addElement);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let title = document.querySelector('.css-2p454n').textContent
  sendResponse(title);
});
