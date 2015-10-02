#TODO

##qix:
* ~~utility qix.requireP -> requirePromise~~ *fatto ma vedi punto ext-plugin*
* diversificare il qix![dep] plugin (template, requireP, template+binder) **( ?? dico bene? forse sono i binder ? .. e vedi punto ext-plugin)**
* valutare l'utilizzo direttamente in qix di plugin esterni https://github.com/jrburke/requirejs/wiki/Plugins

##compile:
* ~~permettere ai binder dell'elemento di aumentare il ctx .. 
	probabilmente per ogni elemento bisogna passare un nuovo obj con proto il ctx superiore 
	invece che il ctx stesso.~~
* il compile prende opzioni e ritorna il ctx (nuovo oggetto con eventuali azzi e mazzi), 
  al binder vengono passate le sue opzioni(o un wrap), compile assegna il binder export al ctx[nome_binder]    
* *fatto.. da valutare* ~~valutare l'opzione elem.$qix per il context~~
* valutare l'opzione «stop compile» nella fase di binding
* refactor (anche con qix.requireP) per maggiore linearità e leggibilità
* vedere punto2 ~~riflettere su cosa deve tornare il compile (ctx ? elem ?  ?? ??)~~
* ~~eliminare bluebird e metterci un Promise minimalista integrato :)~~
	.... **usata versione modificata di https://gist.github.com/briancavalier/814318**
	* ~~https://gist.github.com/unscriptable/814052~~
	* ~~https://gist.github.com/briancavalier/814318~~
	* ~~https://github.com/RubenVerborgh/promiscuous/blob/master/promiscuous.js~~
