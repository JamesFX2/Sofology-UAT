function cleanCanonicalURL(url) {
  if (url.indexOf("/clearance") > -1) {
    if (url.indexOf("refurbished") === -1 && url.indexOf("overstock") === -1) {
      url = "/clearance-sofas";
    }
  }
  if (url !== "/" && url.slice(-1) == "/") {

    url = url.slice(0, -1);
  }
  return url.toLowerCase();
}

function addCanonicalURL() {
  var linkItem = document.querySelector('link[rel=canonical]') ? document.querySelector('link[rel=canonical]') : undefined;
  if (typeof(linkItem) !== 'undefined') {
    linkItem.parentNode.removeChild(linkItem);
  }

  var m = document.createElement('link');
  m.rel = 'canonical';
  m.href = "https://www.sofology.co.uk" + cleanCanonicalURL(window.location.href.split('?')[0].split("sofology.co.uk")[1]);
  document.head.appendChild(m);
}

addCanonicalURL();
