#TODO

+ prova a trasformare i `forEach` in `reduce`
+ ridurre in fn + semplici `populate_controllers`
+ eliminare `root_elems` fare in modo che ci sia un holder sia per il master che per il clone in fase di instanziazione 
+ hooks
  + in `spawn` hook con `root_elems`
  + in `populate_controllers` per ogni qix ctrl passa il link al hook per cusomizzazioni pre-factory (i.e. modifica ns-attrs..).. link.attrs potrebbe avere anche un set e un get single (`get_ctrl_attributes(ctrl_name, elem)` -> `get_ctrl_attributes(ctrl_name, elem [, name [, val] ] )`)) 
  + in `make_qix` hook con `master_element` chiamato ovviamente un'unica volta al primo require.. utile per «plugin» globali
+ qix traverse (find, all, ...)
+ qix events
 	+ lifecycle (no recycle a causa dei hooks che modificano localmente)


#Later
+ far funzionare source map 