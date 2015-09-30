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
