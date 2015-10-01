General:
--------
* utility qix.requireP -> requirePromise 

Compiler:
---------
* *fatto* ~~permettere ai binder dell'elemento di aumentare il ctx .. 
	probabilmente per ogni elemento bisogna passare un nuovo obj con proto il ctx superiore 
	invece che il ctx stesso.~~
* *fatto.. valutare* ~~valutare l'opzione elem.$qix per il context~~
* valutare l'opzione «stop compile» nella fase di binding
* refactor (anche con qix.requireP) per maggiore linearità e leggibilità
* riflettere su cosa deve tornare il compile (ctx ? elem ?  ?? ??)
* ~~eliminare bluebird e metterci un Promise minimalista integrato :) https://gist.github.com/unscriptable/814052 https://gist.github.com/briancavalier/814318 https://github.com/RubenVerborgh/promiscuous/blob/master/promiscuous.js  .... **usata versione modificata di https://gist.github.com/briancavalier/814318** ~~
