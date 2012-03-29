(function(){
	app.routes = function(){		
		for (var i = 0, routes = app.config.routes; i < routes.length; i++) {
			Path.map(routes[i]).to(function(){
				app.layout.page(this.path, this.params['id']);
			});
		};
		return (function(){
			Path.history.listen();
			Path.dispatch("/");
		})();
	};
})();