// Based on @adeneo answer on SO
// https://stackoverflow.com/questions/45291962/vanilla-js-version-of-jquery-document-on-click-for-links
exports.addEvent = function addEvent(parent, evt, selector, handler) 
{
    parent.addEventListener(evt, function(event) {
    if (event.target.matches(selector + ', ' + selector + ' *')) 
    { handler.apply(event.target.closest(selector), arguments); }
  }, false);    
}

exports.insertArray = function insertArray(array1, array2,insertindex)
{
  return array1.slice(0, insertindex).concat(array2).concat(array1.slice(insertindex));
}