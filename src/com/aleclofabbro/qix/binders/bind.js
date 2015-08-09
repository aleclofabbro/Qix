define([
    'rx'
  ],
  function(Rx) {

    return {
      bind: function(el) {
        // console.log('bind:', el);
        el.$qix.broadcast.subscribe(function(v) {
          el.innerText = v;
          // console.log('bound', v, el);
        })
        return {};
      }
    };
  });