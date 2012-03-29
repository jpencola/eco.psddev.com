(function(){
	app.behavior = {};
	app.behavior.init = function(route){
		this.reset();
		if(!app.isAuthed && route === "index")
			return this.login();
		else if(!app.isAuthed && route === "register")
			return this.register();
		else if(app.isAuthed && route === "logout")
			return this.logout();
	};

	app.behavior.login = function(){
		var login = app.select.item("#login");
		var submit = login.find("input[type=submit]");
		submit.click(function(e){
			e.preventDefault();
			return $.post("/_api/login", login.inputs("get"), function(res){
				if (res.status === "error")
					return app.behavior.error(res)
				return window.location = "/";
			});
		});
	};

	app.behavior.logout = function(){
		var confirm = window.confirm("Would you like to logout?") || false;
		if (confirm)
			return $.get("/_api/logout", function(res){
				if (res.status === "error")
					return app.behavior.error(res)
				return window.location = "/";
			});
	};

	app.behavior.add_note = function(){
		var add_note = app.select.item("#add-note");
		var submit = add_note.find("input[type=submit]");

		app.behavior.reset();

		submit.click(function(e){
			e.preventDefault();
			return $.post("/_api/notes", add_note.inputs("get"), function(res){
				if (res.status === "error")
					return app.behavior.error(res)
				return window.location = "/";
			});
		});
	};


	app.behavior.register = function(){
		var register = app.select.item("#register");
		var submit = register.find("input[type=submit]");
		var data;
		submit.click(function(e){
			e.preventDefault();
			return $.post("/_api/register", register.inputs("get"), function(res){
				if (res.status !== "error")
					Path.dispatch("/");
				return app.behavior.error(res)
			});
		});
	};

	app.behavior.reset = function(){
		return app.select.item("a", true).click(function(){
			Path.history.pushState({}, "", $(this).attr("href"));
			return false;
		});
	};

	app.behavior.get_categories = function() {
		var result = "";
		$.ajax({
			"async" : false, 
			"url" : "/_api/categories",
			"success" : function(res) {
				if (res.status == "error")
					return app.behavior.error(res.message);
				result = res.message;
			}
		});
		return result;
	};

	app.behavior.get_quarters = function() {
		var result = [1,2,3,4];
		return result;
	};
	
	app.behavior.get_priorities = function() {
		var result = ["none", "low", "medium", "high"];
		return result;
	};

	app.behavior.error = function(data){

		app.select.item("#alert").remove();

		var alert = app.select.template("alert")
			.replace("{{class}}", data.status)
			.replace("{{message}}", data.message);

		app.select.item("body").append(alert)

		app.select.item("#alert").fadeIn(app.config.fade).find(".close").click(function(){
			$(this).parent().fadeOut(app.config.fade, function(){
				return $(this).remove();
			});
			return false;
		});

	};
})();