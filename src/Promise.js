define(function() {
  function _passthroug(v) {
    return v;
  };

  function Promise(_pr_resolver) {
    var p = __Promise();
    setTimeout(function() {
      _pr_resolver(p.resolve, p.reject);
    });
    return p;
  };

  function __Promise() {
    var callbacks = [],
      promise = {
        resolve: resolve,
        reject: reject,
        then: then,
        timeout: timeout,
        safe: {
          then: function safeThen(resolve, reject) {
            promise.then(resolve, reject);
          }
        }
      };

    function timeout(ms, msg) {
      msg = msg || 'Promise Timeout';
      var p = promise
        .then(function(resp) {
          clearTimeout(_to);
          return resp;
        }, function(resp) {
          clearTimeout(_to);
          return resp;
        });
      var _to = setTimeout(p.reject.bind(p, msg), ms);
      return p;
    }

    function complete(type, result) {
      promise.then = type === 'reject' ? function(resolve, reject) {
        reject(result);
      } : function(resolve) {
        resolve(result);
      };

      promise.resolve = promise.reject = function() {
        //throw new Error("Promise already completed");
      };

      var i = 0,
        cb;
      while (cb = callbacks[i++]) {
        cb[type] && cb[type](result);
      }

      callbacks = null;
    }

    function resolve(result) {
      complete('resolve', result);
    }

    function reject(err) {
      complete('reject', err);
    }

    function then(resolve, reject) {
      resolve = resolve || _passthroug;
      reject = reject || _passthroug;
      var _sub_promise = __Promise();
      callbacks.push({
        resolve: function(x) {
          _sub_promise.resolve(resolve(x));
        },
        reject: function(x) {
          _sub_promise.reject(reject(x));
        }
      });
      return _sub_promise;
    }

    return promise;
  };
  Promise.resolve = function(v) {
    return Promise(function(res) {
      res(v);
    });
  };
  Promise.all = function(arr) {
    var _count = arr.length;
    var promise = __Promise();
    if (arr.length) {
      var _responses = [];
      arr.forEach(function(_p, _i) {
        _p.then(function(_resp) {
          _responses[_i] = _resp;
          _count--;
          if (!_count)
            promise.resolve(_responses);
        }, promise.reject);
      });
    } else
      setTimeout(function() {
        promise.resolve([]);
      });
    return promise;
  };

  return Promise;
});