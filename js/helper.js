// Based on @adeneo answer on SO
// https://stackoverflow.com/questions/45291962/vanilla-js-version-of-jquery-document-on-click-for-links
exports.addEvent = function addEvent(parent, evt, selector, handler) 
{
    parent.addEventListener(evt, function(event) {
    if (event.target.matches(selector + ', ' + selector + ' *')) 
    { handler.apply(event.target.closest(selector), arguments); }
  }, false);    
}