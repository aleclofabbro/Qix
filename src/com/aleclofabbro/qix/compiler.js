define([
  'rx'
], function(Rx) {
  var _qix_regexp = /^qix(?:-*).*(?=:)/;
  var Qix = function(elem, par_ctx) {
    this.parent = par_ctx;
    this.element = elem;
    this.broadcast = new Rx.Subject();
    this.emit = new Rx.Subject();
    if (this.parent) {
      this.parent.broadcast
        .map(function(ev) {
          return ev;
        })
        .subscribe(this.broadcast);
      this.emit
        .map(function(ev) {
          return ev;
        })
        .subscribe(this.parent.emit);
    }
  };
  Qix.prototype = {};

  var _rq_obs = Rx.Observable.fromCallback(require);
  var _compile = function(elem, par_ctx) {
    if (elem.$qix)
      throw new Error({
        msg: 'qix : elem already compiled',
        elem
      });
    var _ctrls_reqs = [];

    var _attr_list = document.body.attributes;

    for (var _ix = 0; _ix < _attr_list.length; _ix++) {
      var _attr = _attr_list[_ix];
      // 'qixs-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
      // ["qixs-sloe"]
      // 'qix:asdsa'.match(/^qix(?:-*).*(?=:)/)
      // ["qix"]
      // 'qix-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
      // ["qix-sloe"]
      var match = _attr.name.match(_qix_regexp);
      if (!match)
        return;
      var _ctrl_ns = match[0];
      var _ctrl_name = _attr.name.split(':')[1];
      var _ctrl_path = [_ctrl_ns, _ctrl_name].join('/');
      var _ctrl_obs = _rq_obs([_ctrl_path])
        .map(function(obs) {
          obs.control(elem);
        });
      _ctrls_reqs.push(_ctrl_obs);
    }
    if (_ctrls_reqs.length) {
      var qix = elem.$qix = new Qix(elem, par_ctx);
      Rx.Observable.forkJoin.apply(Rx.Observable, _ctrls_reqs)
        .subscribe(function(ctrls) {
          ctrls.map(function(ctrl) {
            return ctrl(elem);
          });
          for (var _ix = 0; _ix < elem.children.length; _ix++) {
            _compile(elem.children.item(_ix), qix);
          }
        });
    }
  };

  return function(elem, par_ctx) {
    var _elem_clone = document.cloneNode(elem, true);
    _compile(_elem_clone, par_ctx);
    return _elem_clone;
  };
});