define(function() {
  "use strict";

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
    loadElem: function(url, cb) {
      sendRequest(url, function(_doc) {
        var _body = _doc.body;
        cb({
          clone: function() {
            return _body.cloneNode(true);
          },
          master: function() {
            return _body;
          },
          doc: function() {
            return _doc;
          }
        });
      });
    },
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      this.loadElem(url, onload);
    }
  }
});