--- 
Compile -skip-root

DONE 
----

usare curry?

- implementare per lo scope (diventerà ctx):
	metodi per sezionarlo e alimmentarlo:
	`receiver(receiver_ch, signaler_ch) : obs`
	`signaler(signaler_ch, receiver_ch) : fn(load)`
	`signal(signaler_ch, receiver_ch, load)`


- ai binder (magari fanno da soli dal ctx)
	`signal: scope.signaler.bind(scope, _ctrl_channel)`
	`receiver: scope.receiver.bind(scope, _ctrl_channel)`

- canali speciali:
	`@downstream`
	`@upstream`


- signal[event]:{
	ctx: ctx,
	from: __proto__,
	__proto__: {
		receiver: [string channel],
		signaler: [string channel],
		load: [any],
		ctx: ctx
	}
}


