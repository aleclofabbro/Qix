define(function() {
  "use strict";

  function sendRequest(url, callback) {
    var xhr = createXMLHTTPObject();
    if (!xhr)
      throw new Error('NO XHR!');
    xhr.responseType = "text";
    xhr.open('GET', url, true);
    // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4)
        return;
      if (xhr.status != 200 && xhr.status != 304) {
        //          alert('HTTP error ' + xhr.status);
        return;
      }
      callback(xhr.responseText);
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
      sendRequest(url, function(text) {
        var _body = document.createElement('div');
        _body.innerHTML = text;
        cb({
          clone: function() {
            return this.cloneBody().childNodes;
          },
          cloneBody: function() {
            return _body.cloneNode(true);
          },
          master: function() {
            return _body;
          },
          text: function() {
            return text;
          },
          appendTo: function(to_elem) {
            var children = this.clone();
            Array.prototype.slice.call(children)
              .forEach(function(ch) {
                to_elem.appendChild(ch);
              });
          }
        });
      });
    },
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      this.loadElem(url, onload);
    }
  };
});