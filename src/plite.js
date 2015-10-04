;
(function() {

  'use strict';


  function Plite(resolver) {
    var emptyFn = function() {},
      chain = emptyFn,
      resultGetter;

    function processResult(result, callback, reject) {
      if (result && result.then) {
        result.then(function(data) {
          processResult(data, callback, reject);
        }).catch(function(err) {
          processResult(err, reject, reject);
        });
      } else {
        callback(result);
      }
    }

    function setResult(callbackRunner) {
      resultGetter = function(successCallback, failCallback) {
        try {
          callbackRunner(successCallback, failCallback);
        } catch (ex) {
          failCallback(ex);
        }
      };

      chain();
      chain = undefined;
    }

    function setError(err) {
      setResult(function(success, fail) {
        fail(err);
      });
    }

    function setSuccess(data) {
      setResult(function(success) {
        success(data);
      });
    }

    function buildChain(onsuccess, onfailure) {
      var prevChain = chain;
      chain = function() {
        prevChain();
        resultGetter(onsuccess, onfailure);
      };
    }

    var self = {
      then: function(callback) {
        var resolveCallback = resultGetter || buildChain;

        return Plite(function(resolve, reject) {
          resolveCallback(function(data) {
            resolve(callback(data));
          }, reject);
        });
      },

      catch: function(callback) {
        var resolveCallback = resultGetter || buildChain;

        return Plite(function(resolve, reject) {
          resolveCallback(resolve, function(err) {
            reject(callback(err));
          });
        });
      },

      resolve: function(result) {
        !resultGetter && processResult(result, setSuccess, setError);
      },

      reject: function(err) {
        !resultGetter && processResult(err, setError, setError);
      },

      timeout: function(time, data) {
        var self_pr = this;
        var _to = setTimeout(function() {
          self_pr.reject(data || 'Promise timeout ms:' + time);
        }, time);
        var _p = Plite(function(resolve, reject) {
          self_pr
            .then(function(val) {
              clearTimeout(_to);
              resolve(val);
            })
            .catch(function(err) {
              clearTimeout(_to);
              reject(err);
            });
        });
        return _p;
      }
    };

    resolver && resolver(self.resolve, self.reject);

    return self;
  }

  Plite.resolve = function(result) {
    return Plite(function(resolve) {
      resolve(result);
    });
  };

  Plite.reject = function(err) {
    return Plite(function(resolve, reject) {
      reject(err);
    });
  };

  Plite.race = function(promises) {
    promises = promises || [];
    return Plite(function(resolve, reject) {
      var len = promises.length;
      if (!len) return resolve();

      for (var i = 0; i < len; ++i) {
        var p = promises[i];
        p && p.then && p.then(resolve).catch(reject);
      }
    });
  };

  Plite.all = function(promises) {
    promises = promises || [];
    return Plite(function(resolve, reject) {
      var len = promises.length,
        count = len;

      if (!len) return resolve();

      function decrement() {
        --count <= 0 && resolve(promises);
      }

      function waitFor(p, i) {
        if (p && p.then) {
          p.then(function(result) {
            promises[i] = result;
            decrement();
          }).catch(reject);
        } else {
          decrement();
        }
      }

      for (var i = 0; i < len; ++i) {
        waitFor(promises[i], i);
      }
    });
  };

  if (typeof exports === 'object') {
    module.exports = Plite;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return Plite;
    });
  } else {
    this.Plite = Plite;
  }

}.call(this));