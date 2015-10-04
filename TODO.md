#TODO

##New Syntax

+ qix-engine dispatch nodes to compilers to compile them in differt ways
	+ builtin compilers are
		+ `element controller compiler`: `<elem qix:prop="/path/to/module" qix:other-prop="/path/to/module" prop:option="option for binder named prop"></elem>` returns a promise for `ctrl` object with all controllers assigned 
      + loads modules, and assign them to `ctrl.prop` 
      + each module elaboration specifies a `binder-object` 
        + elem
        + `prop:options` object from attributes
        + ctx
        + controller-ctx (`ctx[binderdef.name]`)
        + promise|sub for the fullfilled `ctrl` 
        + binder definition
          + name
          + path
          + attr
      + if module defines `module.$qix = ['dep1','dep2',function (injected1,injected2 ){ ... return controller;}]` it will be called with `injections` and the return value assigned to `ctrl.prop` instead of the module itself
        + `injectors` will be invoked with a `binder-object` expexcting as return the injection of dep for `$qix`
        + builtin `injector` are:
          + `binder-object` , it delivers the `binder-object`

##getters per namespaced [opzioni, attributi, elementi(?)]   (invece di oggetti come ora)