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

  function loadElem(url, cb) {
    sendRequest(url, function(templ_text) {
      var _body = document.createElement('div');
      _body.innerHTML = templ_text;

      function clone() {
        return cloneBody().childNodes;
      }

      function cloneBody() {
        return _body.cloneNode(true);
      }

      function master() {
        return _body;
      }

      function text() {
        return templ_text;
      }

      function appendTo(to_elem) {
        var children = clone();
        Array.prototype.slice.call(children)
          .forEach(function(ch) {
            to_elem.appendChild(ch);
          });
      }

      cb({
        clone: clone,
        cloneBody: cloneBody,
        master: master,
        text: text,
        appendTo: appendTo,
      });
    });
  }

  function load(name, parentRequire, onload, config) {
    var url = parentRequire.toUrl(name);
    loadElem(url, onload);
  }

  return {
    loadElem: loadElem,
    load: load
  };
});