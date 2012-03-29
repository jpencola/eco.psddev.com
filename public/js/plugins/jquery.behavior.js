/*
 * jQuery Behavior Plugin: Define rich behaviors that include both event 
 * handlers and (un)transformations on DOM elements.
 * 
 * Copyright (c) 2011 Florian Schäfer (florian.schaefer@gmail.com)
 * Dual licensed under the MIT (MIT_LICENSE.txt)
 * and GPL Version 2 (GPL_LICENSE.txt) licenses.
 *
 * Version: 1.1
 * Requires: jQuery 1.4.2+ and Live Query 1.1+.
 * 
 */

(function(a,c){a.attr=function(d,g,b){var e=c(d,g),f=e;b?(a.event.trigger("setAttr",{attribute:g,from:e,to:b},d),f=c.apply(this,arguments),e!==b&&a.event.trigger("changeAttr",{attribute:g,from:e,to:b},d)):a.event.trigger("getAttr",{attribute:g,from:e,to:b},d);return f}})(jQuery,jQuery.attr); (function(a){if(!a.fn.livequery)throw"jquery.behavior.js: jQuery Plugin: Live Query not loaded.";a.behavior=function(c,d){d=d||window.document;return!c?this:a.isArray(c)?a.each(c,function(){a.behavior(this,d)}):a.each(c,function(c,b){var b=a.extend({options:{expire:!1},transform:a.noop,untransform:a.noop},b),e=a(c,d);b.options.expire&&e.expire();e.livequery(b.transform,b.untransform);for(var f in b)switch(f){case "transform":case "untransform":case "options":continue;default:e.livequery(f,b[f])}})}; a.fn.behavior=function(c){return this.each(function(){a.behavior(c,this)})}})(jQuery);