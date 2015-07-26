define(function() {
  function sendRequest(url, callback) {
    var xhr = createXMLHTTPObject();
    if (!xhr)
      throw new Error('NO XHR!');
    xhr.responseType = "document";
    xhr.open('GET', url, true);
    // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4)
        return;
      if (xhr.status != 200 && xhr.status != 304) {
        //          alert('HTTP error ' + xhr.status);
        return;
      }
      callback(xhr.responseXML);
    }
    if (xhr.readyState == 4)
      return;
    xhr.send();
  }

  var XMLHttpFactories = [
    function() {
      return new XMLHttpRequest()
    },
    function() {
      return new ActiveXObject("Msxml2.XMLHTTP")
    },
    function() {
      return new ActiveXObject("Msxml3.XMLHTTP")
    },
    function() {
      return new ActiveXObject("Microsoft.XMLHTTP")
    }
  ];

  function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }
  return {
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      sendRequest(url, function(doc) {
        var elem = doc.body.children[0];
        onload({
          get: function() {
            return elem.cloneNode(true);
          },
          elem: function() {
            return elem;
          }
        });
      });
    }
  }
});