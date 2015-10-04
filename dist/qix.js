(function(){"use strict";function e(t){function s(e,t,n){e&&e.then?e.then(function(e){s(e,t,n)}).catch(function(e){s(e,n,n)}):t(e)}function o(e){i=function(t,n){try{e(t,n)}catch(r){n(r)}},r(),r=undefined}function u(e){o(function(t,n){n(e)})}function a(e){o(function(t){t(e)})}function f(e,t){var n=r;r=function(){n(),i(e,t)}}var n=function(){},r=n,i,l={then:function(t){var n=i||f;return e(function(e,r){n(function(n){e(t(n))},r)})},"catch":function(t){var n=i||f;return e(function(e,r){n(e,function(e){r(t(e))})})},resolve:function(e){!i&&s(e,a,u)},reject:function(e){!i&&s(e,u,u)},timeout:function(t,n){var r=this,i=setTimeout(function(){r.reject(n||"Promise timeout ms:"+t)},t),s=e(function(e,t){r.then(function(t){clearTimeout(i),e(t)}).catch(function(e){clearTimeout(i),t(e)})});return s}};return t&&t(l.resolve,l.reject),l}e.resolve=function(t){return e(function(e){e(t)})},e.reject=function(t){return e(function(e,n){n(t)})},e.race=function(t){return t=t||[],e(function(e,n){var r=t.length;if(!r)return e();for(var i=0;i<r;++i){var s=t[i];s&&s.then&&s.then(e).catch(n)}})},e.all=function(t){return t=t||[],e(function(e,n){function s(){--i<=0&&e(t)}function o(e,r){e&&e.then?e.then(function(e){t[r]=e,s()}).catch(n):s()}var r=t.length,i=r;if(!r)return e();for(var u=0;u<r;++u)o(t[u],u)})},typeof exports=="object"?module.exports=e:typeof define=="function"&&define.amd?define("plite",[],function(){return e}):this.Plite=e}).call(this),define("compilers/elem-controller",["../plite"],function(e){"use strict";function r(t,i,s,o){if(t.nodeType!==1)return s();var u=n(t,i);if(!u.length)s();else{var a=u.map(function(t){var n=e(function(e,n){require([t.path],function(r){var i=[t,e,n];"function"==typeof r&&r.name==="$qix"?r.apply(null,i):r&&"function"==typeof r.$qix?r.$qix.apply(r,i):e(r)},n)});return n.then(function(e){return i[t.prop]=e,e}).timeout(r.TIMEOUT,{msg:"Qix elem controller timeout ms:"+r.TIMEOUT,ctrl:t})});e.all(a).then(s).catch(function(e){return console.error("Qix elem controller error:",e),o(e),e})}}var t=function(e){return Array.prototype.slice.call(e)},n=function(e,n){return t(e.attributes).filter(function(e){return e.name.startsWith("qix:")}).map(function(r){var i=r.name.split(":")[1],s=r.value,o=function(){return t(e.attributes).filter(function(e){return e.name.split(":")[0]===i}).reduce(function(e,t){return e[t.name.split(":")[1]]=t.value,e},{})},u=function(){var e=n[i];return"function"==typeof e?e():e};return{attr:r,opts:u,prop:i,args:o,path:s,elem:e,ctx:n}})};return r.TIMEOUT=3e3,r}),define("compile",["./plite","./compilers/elem-controller"],function(e,t){"use strict";function r(t,i){var s={},o;"number"==typeof t.length?o=n(t):o=[t];var u=o.map(function(t){var n=r.compilers.map(function(n){var r={compiler:n,node:t},o=e(function(e,r){n(t,i,e,r)}).then(function(e){s[n.name]=e});return o.then(function(e){return e})});return e.all(n).then(function(e){return r(t.childNodes,i)})});return e.all(u).timeout(r.TIMEOUT,"Qix Compile timeout ms:"+r.TIMEOUT).catch(function(e){return console.error("Qix compile error:",e),e})}r.TIMEOUT=5e3,r.compilers=[t];var n=function(e){return Array.prototype.slice.call(e)};return r}),define("require-plugins/element-loader",[],function(){"use strict";function e(e,t){var r=n();if(!r)throw new Error("NO XHR!");r.responseType="text",r.open("GET",e,!0),r.onreadystatechange=function(){if(r.readyState!=4)return;if(r.status!=200&&r.status!=304)return;t(r.responseText)};if(r.readyState==4)return;r.send()}function n(){var e=!1;for(var n=0;n<t.length;n++){try{e=t[n]()}catch(r){continue}break}return e}var t=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];return{loadElem:function(t,n){e(t,function(e){var t=document.createElement("div");t.innerHTML=e,n({clone:function(){return this.cloneBody().childNodes},cloneBody:function(){return t.cloneNode(!0)},master:function(){return t},text:function(){return e}})})},load:function(e,t,n,r){var i=t.toUrl(e);this.loadElem(i,n)}}}),define("qix",["./compile","./plite","./require-plugins/element-loader"],function(e,t,n){"use strict";return{requireP:function(e,n){var r=t.Promise();return(n||require)(e,function(){return res([].slice.call(arguments))},rej),r},compile:e,load:function(t,r,i,s){var o=r.toUrl(t);n.loadElem(o,function(t){var n=Object.create(t);n.compileTo=function(n,r){return e(t.cloneBody(),r).then(function(e){return Array.prototype.slice.call(e.childNodes).forEach(function(e){n.appendChild(e)}),e.childNodes})},n.compile=function(n){return e(t.cloneBody(),n).then(function(e){return e.childNodes})},i(n)},function(e){console.error("qix loader err:",e)})}}});