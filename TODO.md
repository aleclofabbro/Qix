#TODO

+ prova a trasformare i `forEach` in `reduce`
+ testare e capire bene come giocano i `require()` local (relativo al component-path) e/o global .. (ora sono solo global)
+ ridurre in fn + semplici `bind_controllers`
+ eliminare `root_elems` (gli array) fare in modo che ci sia un holder sia per il master che per il clone in fase di instanziazione .. forse utilizzando [`<template>`](https://developer.mozilla.org/it/docs/Web/HTML/Element/template) ? .. (ma forse no .. infatti è utile perché quando si trova sparato nell html non viene renderizzato, in più [non è completamente supportato](http://caniuse.com/#feat=template))
+ hooks
  + *master* in `make_qix` -> `master_element` chiamato ovviamente un'unica volta al primo require dopo che le sub dipendenze sono state risolte.. utile per «plugin» e modifiche globali dei componenti
  + *template* in `spawn` -> `root_elems` per elaborazione locale del clone prima del processo di binding
  + *link* in `bind_controllers` -> `link` per ogni `qix_ctrl` per customizzazioni pre-factory (i.e. modifica ns-attrs..)
+ link
	+ `attrs()` overload per single-getter e setter : `get_ctrl_attributes(ctrl_name, elem [, name [, val] ] )` 
	+ qix traverse (find, all, ...)
	+ qix events
	 	+ lifecycle (no recycle a causa dei hooks che modificano localmente)

##Later
+ far funzionare source map 
