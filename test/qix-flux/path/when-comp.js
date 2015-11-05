define(function() {
  return function(elem, binders, link) {
    console.log('WHEN COMP', link.get_attrs());
    elem.innerText = 'WHEN COMP' + link.get_attrs().par;
  };
});