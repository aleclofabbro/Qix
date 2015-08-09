define([
  'require',
  'rx',
  'rx.async',
  'rx.experimental',
  'rx.aggregates'
], function(require, Rx) {
  var _qix_regexp = /^qix(?:-*).*(?=:)/;
  var _interpolator = function(textNode, qix) {
    if (textNode.textContent.trim() === '*')
      qix.broadcast.subscribe(function(v, qix) {
        textNode.textContent = v;
      });
  };
  var Qix = function(elem, parent) {
    this.broadcast = new Rx.Subject();
    this.emit = new Rx.Subject();
    if (parent) {
      parent.broadcast
        .map(function(ev) {
          return ev;
        })
        .subscribe(this.broadcast);
      this.emit
        .map(function(ev) {
          return ev;
        })
        .subscribe(parent.emit);
    }
    elem.$qix = this;
    this.parent = parent;
    this.element = elem;
  };
  Qix.prototype = {
    spawn: function(elem) {
      var _sub_qix = new Qix(elem, this);
      return _sub_qix;
    },
    isRoot: function() {
      return this === rootQix;
    }
  };
  var rootQix = new Qix(document);

  var _require_obs = Rx.Observable.fromCallback(require);
  var _compile = function(elem, parent_qix) {
    // compila elem
    // se !parent_qix allora è root 
    // se elem.$qix allora è già compilato 
    if (elem.$qix)
      throw new Error({
        msg: 'qix : elem already compiled',
        elem: elem
      });

    // array di attr
    var _attr_list = Array.prototype.slice.call(elem.attributes);

    // 'qixs-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["qixs-sloe"]
    // 'qix:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["qix"]
    // 'qix-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["qix-sloe"]
    var _filtered_defs =
      _attr_list
      .map(function(_attr) { // mappa gli attributi con delle def di binder_provider oppure false 
        var match = _attr.name.match(_qix_regexp);
        if (!match)
          return false;
        else {
          var _binder_ns = match[0] === 'qix' ? './binders/' : match[0];
          var _binder_name = _attr.name.split(':')[1];
          var _binder_path = [_binder_ns, _binder_name].join('/');
          return {
            ns: _binder_ns,
            name: _binder_name,
            path: _binder_path,
            attr: _attr
          }
        }
      })
      .filter(function(binder_def) { // filtra quelli non  qix
        return binder_def !== false;
      });

    // IL QIX

    if (!parent_qix) // se non c'è parent è root
      parent_qix = rootQix;

    var _current_qix; // il qix
    if (_filtered_defs.length) // se ci sono qix allora spawn
      _current_qix = parent_qix.spawn(elem);
    else
      _current_qix = parent_qix // se non ci sono allora il qix è il parent
      // -- IL QIX

    var _binders_reqs_obs_arr =
      _filtered_defs
      .map(function(binder_def) { // mappa i binder_def con binders observers 
        return _require_obs([binder_def.path]) // require_2_observer
          .map(function(binder_provider) {
            return binder_provider.bind(elem, binder_def); // binder
          });
      });


    return Rx.Observable.forkJoin(_binders_reqs_obs_arr)
      .lastOrDefault(null, [])
      .flatMap(function(all_curr_binders_array) {
        var _child_nodes_arr = Array.prototype.slice.call(elem.childNodes);
        var _children_compile_obs_arr =
          _child_nodes_arr
          .filter(function(_child) {
            if (_child.nodeType === 3)
              _interpolator(_child, _current_qix)
            return _child.nodeType === 1;
          })
          .map(function(_child) {
            return _compile(_child, _current_qix);
          });
        return Rx.Observable.forkJoin(_children_compile_obs_arr)
          .lastOrDefault(null, [])
          .map(function(_all_children_qix_array) {
            return _current_qix;
          });
      });
  };

  var _export = function(elem, parent_qix) {
    var _elem_clone = document.cloneNode(elem, true).body.children[0];
    return _compile(_elem_clone, parent_qix)
      .map(function(qix) {
        _elem_clone.$qix = qix;
        return _elem_clone;
      });
  };
  _export.rootQix = function() {
    return rootQix;
  }
  return _export;
});