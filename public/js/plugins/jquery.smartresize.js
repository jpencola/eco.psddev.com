/*
 * smartresize: debounced resize event for jQuery
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.smartresize.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function(a){var b=a.event,c;b.special.smartresize={setup:function(){a(this).bind("resize",b.special.smartresize.handler)},teardown:function(){a(this).unbind("resize",b.special.smartresize.handler)},handler:function(a,b){var d=this,e=arguments;a.type="smartresize";c&&clearTimeout(c);c=setTimeout(function(){jQuery.event.handle.apply(d,e)},b==="execAsap"?0:100)}};a.fn.smartresize=function(a){return a?this.bind("smartresize",a):this.trigger("smartresize",["execAsap"])}})(jQuery);