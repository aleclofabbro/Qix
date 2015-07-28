define(['rx'],
  function(Rx) {
    var vers = [];

    var cont = document.createElement('div');
    cont.style.cssText = 'overflow:scroll;';
    document.body.appendChild(cont);

    var newTick = function(ver, t, v) {
      vers.forEach(function(_ver, i) {
        if (_ver.done)
          return;
        var ev = document.createElement('span');
        ev.style.cssText = 'float:left;width:20px;';
        var ht = '-';

        if (_ver === ver) {
          switch (t) {
            case 'n':
              ht = 'O';
              break;
            case 'e':
              ht = 'X';
              break;
            case 'c':
              ht = '|';
              break;
          }
          if (t !== 'c') {
            var _val = {
              time: new Date(),
              val: v
            };
            ev.addEventListener('click',
              function() {
                console[(t === 'e') ? 'err' : 'log'](_val);
              });
          }
          if (t !== 'n') {
            _ver.done = true;
          }
        }
        ev.innerHTML = ht;
        _ver.line.appendChild(ev)
      });
    };
    return {
      get: function(tag) {
        var ver = Rx.Observer.create(function(v) {
          newTick(ver, 'n', v);
        }, function(e) {
          newTick(ver, 'e', e);
        }, function() {
          newTick(ver, 'c');
        });

        var elem = document.createElement('span');
        elem.style.cssText = 'float:left;clear:both;';
        ver.elem = elem;
        cont.appendChild(elem);

        var head = document.createElement('span');
        head.style.cssText = 'float:left;width:100px;';
        head.innerHTML = tag;
        ver.head = head;
        elem.appendChild(head);

        var line = document.createElement('span');
        line.style.cssText = 'float:left;';
        ver.line = line;
        elem.appendChild(line);

        vers.push(ver);
        return ver;
      }
    };
  });