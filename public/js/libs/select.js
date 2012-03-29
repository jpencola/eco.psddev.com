(function(){
	app.select = {};
	
	app.select.item = function(selector, all){
		if (!all)
			return $(document.querySelector(selector));
		return $(document.querySelectorAll(selector));
	};

	app.select.template = function(route){
		return $(document.querySelectorAll('[data-template="'+ route +'"]')).html();
	};

})();