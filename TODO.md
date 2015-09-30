General:
--------
* utility qix.requireP -> requirePromise 

Compiler:
---------
* permettere ai binder dell'elemento di aumentare il ctx .. 
	probabilmente per ogni elemento bisogna passare un nuovo obj con proto il ctx superiore 
	invece che il ctx stesso.
* valutare l'opzione elem.$qix per il context
* valutare l'opzione «stop compile» nella fase di binding
* refactor (anche con qix.requireP) per maggiore linearità e leggibilità
* riflettere su cosa deve tornare il compile (ctx ? elem ?  ?? ??)
* eliminare bluebird e metterci un Promise minimalista integrato :) https://gist.github.com/unscriptable/814052 https://gist.github.com/briancavalier/814318 https://github.com/RubenVerborgh/promiscuous/blob/master/promiscuous.js



https://gist.github.com/briancavalier/814318
function Promise() {
	var callbacks = [],
		promise = {
			resolve: resolve,
			reject: reject,
			then: then,
			safe: {
				then: function safeThen(resolve, reject) {
					promise.then(resolve, reject);
				}
			}
		};

	function complete(type, result) {
		promise.then = type === 'reject'
			? function(resolve, reject) { reject(result); }
			: function(resolve)         { resolve(result); };
		
		promise.resolve = promise.reject = function() { throw new Error("Promise already completed"); };
		
		var i = 0, cb;
		while(cb = callbacks[i++]) { cb[type] && cb[type](result); }
		
		callbacks = null;
	}
	
	function resolve(result) {
		complete('resolve', result);
	}
	function reject(err) {
		complete('reject', err);
	}
	function then(resolve, reject) {
		callbacks.push({ resolve: resolve, reject: reject });
	}

	return promise;
};