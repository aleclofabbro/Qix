#TODO

##New Syntax

+ qix-engine dispatch nodes to compilers to compile them in differt ways
	+ builtin compilers are
		+ `element controller compiler`: `<elem qix:prop="/path/to/module" prop:option="option for binder named prop" qix:other-prop="/path/to/module"></elem>` 
		+ **(TODO)** `text node compiler`: template engine per i text node

###Todo:
+ il ritorno dell'engine deve essere un oggetto distinto da `ctx` ( `Object.create(ctx)` oppure `{}` ) ... 
+ getter per options: 
	+ `nsctx`: `ctx[prop-ns]`
	+ `attrs`: object for `< prop-ns-attributes >`
	+ `opts`: `Object.create(attrs).mixin(nsctx)` così le opzioni programmatiche overridano gli attributi xml 
+ attr.name tipo `my-prop` si trasformano in `my_prop` 



*ci sono sobrapposizioni/conflitti con più tpl nello stesso... -- -- *