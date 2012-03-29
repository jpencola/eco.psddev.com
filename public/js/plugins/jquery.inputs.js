/*
 * jquery-inputs is a jQuery plugin that allows set/get on form inputs using hierarchical JSON structures
 *
 * For usage and examples, visit: http://github.com/dshimkoski/jquery-inputs/
 *
 * MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, Denny Shimkoski (denny.webdev -[at]- gmail -[dot]- com )
 */
 
 (function(e,n){function l(d,j,b){for(var c,i,h=[],f=0,g,a="";g=d[f++];)switch(g){case " ":case "_":case ".":case "[":case "]":if(g==="]"&&!a.length){var a=0,k;for(k in b)b.hasOwnProperty(k)&&k%1===0&&(a=Math.max(parseInt(k,10)+1,a))}if(a===0||a)c=b,i=a,b[a]===n&&(b[a]={}),b=b[a],h.push(a);a="";break;default:a+=g}a.length?h.push(a):(b=c,a=i);!b[a]||e.isEmptyObject(b[a])?b[a]=j:(e.isArray(b[a])||(b[a]=[b[a]]),b[a].push(j));return h}var m={set:function(d){var j={};e(this).find(":input").each(function(){var b= e(this),c=d,i=!0;b.is(":checkbox, :radio")?b.attr("checked",!1):b.val("");for(var h=l(b.attr("name"),null,j),f=0,g=h.length;f<g;f++){var a=h[f];if(!c[a]){i=!1;break}c=c[a]}if(i)if(b.is(":checkbox, :radio"))if(e.isArray(c)){f=0;for(g=c.length;f<g;f++)b.filter("[value="+c[f]+"]").attr("checked",!0)}else b.filter("[value="+c+"]").attr("checked",!0);else b.val(c)})},get:function(){var d={};e.each(e(this).serializeArray(),function(){l(this.name,this.value,d)});return d}};e.fn.inputs=function(d){if(m[d])return m[d].apply(this, Array.prototype.slice.call(arguments,1));else e.error("Method "+d+" does not exist on jQuery.inputs")}})(jQuery);
