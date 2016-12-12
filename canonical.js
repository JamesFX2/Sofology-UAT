/* URLs need to be;
   1. Lowercased
   2. Stripped of query strings and hash fragments.
   3. Trailing slash removed unless homepage.
   4. Soft duplication removed
   5. Forced to https version of URL and www.sofology.co.uk version.

This code attempts to do the above to ensure the best possible canonical URL. 
This is fine as JavaScript but would be better at server side
See http://searchengineland.com/tested-googlebot-crawls-javascript-heres-learned-220157 for reference

Existing implementation is fired via asynch JavaScript so may not form part of Google's render in some circumstances - 
seems to work though.
*/


function cleanCanonicalURL(url) {
  if (url.indexOf("/clearance") > -1 || url.indexOf("/outlet") > -1) {
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
  m.href = "https://www.sofology.co.uk" + cleanCanonicalURL(window.location.href.split("#")[0].split('?')[0].split(window.location.hostname)[1]);
  document.head.appendChild(m);
}

addCanonicalURL();
