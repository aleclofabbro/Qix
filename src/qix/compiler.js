define([
  'require',
  'rx',
  'rx.async',
  'rx.experimental',
  'rx.aggregates'
], function(local_require, Rx) {
  var _qix_regexp = /^qix(?:-*).*(?=:)/;
  var _interpolator = function(textNode, qix) {
    if (textNode.textContent.trim() === '*')
      qix.broadcast.subscribe(function(v, qix) {
        textNode.textContent = 'interpolated:' + v;
      });
  };
  var Qix = function(elem, parent) {
    this.id = Qix.count++;
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
  Qix.count = 0;
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

  var _compile = function(elem, parent_qix, cb) {
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
    var _filtered__attr_defs =
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
    if (_filtered__attr_defs.length) // se ci sono qix allora spawn
      _current_qix = parent_qix.spawn(elem);
    else
      _current_qix = parent_qix // se non ci sono allora il qix è il parent
      // -- IL QIX

    var _binders_paths =
      _filtered__attr_defs
      .map(function(binder_def) { // mappa i binder_def con binders  
        return binder_def.path;
      });
    local_require(_binders_paths, function() {
      var _binders = Array.prototype.slice.call(arguments);
      _binders.forEach(function(binder, index) {
        binder.bind(elem, _filtered__attr_defs[index]);
      });
      _continue_crawl();
    });



    var _child_nodes_arr = Array.prototype.slice.call(elem.childNodes);
    var _children_to_compile_arr =
      _child_nodes_arr
      .filter(function(_child) {
        if (_child.nodeType === 3) {
          _interpolator(_child, _current_qix)
          return false;
        }
        return _child.nodeType === 1;
      });

    var _children_to_compile_number = _children_to_compile_arr.length;
    // var _children_qixs = [];
    var _continue_crawl = function() {
      if (!_children_to_compile_number)
        cb(_current_qix);
      else
        _children_to_compile_arr
        .forEach(function(_child, index) {
          return _compile(_child, _current_qix, function(_child_qix) {
            // _children_qixs[index] = _child_qix;
            if (!--_children_to_compile_number)
              cb(_current_qix);
          });
        });
    };
  };

  var _export = function(elem, parent_qix, cb) {
    var _elem_clone = elem; // document.cloneNode(elem, true).body.children[0];
    return _compile(_elem_clone, parent_qix, function(qix) {
      _elem_clone.$qix = qix;
      cb(_elem_clone);
    });
  };
  _export.rootQix = function() {
    return rootQix;
  }
  return _export;
});