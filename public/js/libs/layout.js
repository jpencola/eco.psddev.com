(function(){
	
	app.layout = {};

	app.layout.page = function(r, id){

		// cache this obj
		var page = this.page;

		// sanitize routes
		page.route = r.replace("/", "").replace("/:id", "").toLowerCase();
		page.route ? page.route : page.route = "index";
		page.id = id;

		// get & build template
		page.template = app.select.template(page.route);

		// grab body
		page.body = app.select.item("body");
		
		// run
		return page.init();	

	};

	app.layout.page.init = function(){
		var page = this;
		if (!app.isAuthed && page.route === "index")
			return page.login();
		if (!app.isAuthed && page.route === "register")
			return page.register();
		if (app.isAuthed && page.route === "logout")
			return page.logout();
		if (app.isAuthed && page.route === "add")
			return page.add();
		if (app.isAuthed && page.route === "index")
			return page.main();
	};

	app.layout.page.main = function(){
		
		// cache this & and get template
		var page = this;
		var template = page.template;
		var notes = app.select.template("notes");

		app.layout.page.clear(false, function(){



			// append template
			page.body.append(app.layout.page.main.categories(template));

			// get template element
			var wrapper = app.select.item(".module.wrapper");

			// append notes
			app.layout.page.main.notes(notes);

			wrapper.css("height", (app.select.item("body").height() - 151));
			app.select.item(".orb-wrapper").delay(200).fadeIn(app.config.fade, function(){
				wrapper.fadeIn(app.config.fade, function(){
					$(window).smartresize(function(){ wrapper.css("height", (app.select.item("body").height() - 151)); });
				});
				return app.behavior.init();
			});

		});
	};

	app.layout.page.clear = function(orb, callback){
		var wrapper = app.select.item(".module.wrapper");
		if (wrapper.length) {
			return wrapper.fadeOut(app.config.fade, function(){
				$(this).remove();
				if (orb) app.select.item(".orb-wrapper").fadeOut(300);
				if (typeof callback === "function")
					return callback();
			});
		};
		return callback();
	};

	app.layout.page.add = function(){

			
		var categories = "";
		var quarters = "";
		var priorities = "";

		for (var i = 0, item = app.behavior.get_categories(), len = item.length; i < len; i++) {
			categories += "<li><label>" + item[i] + "</label><input type=\"radio\" name=\"categories\" value=\""+ i +"\"/></li>";
		};

		for (var i = 0, item = app.behavior.get_quarters(), len = item.length; i < len; i++) {
			quarters += "<li><label>" + item[i] + "</label><input type=\"checkbox\" name=\"categories\" value=\""+ i +"\"/></li>";
		};

		for (var i = 0, item = app.behavior.get_priorities(), len = item.length; i < len; i++) {
			priorities += "<li><label>" + item[i] + "</label><input type=\"radio\" name=\"categories\" value=\""+ i +"\"/></li>";
		};

		var type = this.id;
		var route = this.route;
		var body = this.body;
		var edit = app.select.template(route + "-" + type)
			.replace("{{radio}}", "<ul class=\"categories\">" + categories + "</ul>")
			.replace("{{quarters}}", "<ul class=\"quarters\">" + quarters + "</ul>")
			.replace("{{priorities}}", "<ul class=\"priorities\">" + priorities + "</ul>");

		app.layout.page.clear(true, function(){
			body.append(app.select.template(route));
			var wrapper = app.select.item(".module.wrapper");
			wrapper.css("height", (app.select.item("body").height() - 151));
			wrapper.find(".full").html(edit).end().fadeIn(app.config.fade, function(){
				$(window).smartresize(function(){ wrapper.css("height", (app.select.item("body").height() - 151)); });
				return app.behavior.add_note();
			});

		});


	};

	app.layout.page.main.count = function(wrapper){
		var count = wrapper.find(".pod").length + 1;
		return wrapper.find("h2.title").html().replace("{{count}}", "(" + count + ")");
	};

	app.layout.page.main.categories = function(template){
		var result = "";
		$.ajax({
			"url" : "/_api/categories",
			"async" : false,
			"success" : function(res){
				if (res.status === "success"){
					for (var i = 0, len = res.message.length; i < len; i++) {
						result += app.select.template("categories")
							.replace("{{title}}", res.message[i])
							.replace("{{id}}", i);
					};
				};
			}
		});
		return template.replace("{{html}}", result);
	};

	app.layout.page.main.notes = function(template){
		var wrapper = app.select.item(".module.map .pod", true);
		$.ajax({
			"url" : "/_api/notes",
			"async" : false,
			"success" : function(res){
				if (res.status === "success"){
					var topics = "";
					var markup = "";
					var priorities = "";
					for (var i = 0, len = res.message.length; i < len; i++) {

						for (var j = 0; j < res.message[i].priorities.length; j++)
							priorities += '<a class="priority ' + res.message[i].priorities[j]  + '" href="#">' + res.message[i].priorities[j] + '</a>';

						for (var k = 0; k < res.message[i].topics.length; k++)
							topics += "<li>" + res.message[i].topics[k] + "</li>";

						markup = template
							.replace("{{priority}}", priorities)
							.replace("{{name}}", res.message[i].name)
							.replace("{{id}}", res.message[i].id)
							.replace("{{topics}}", topics)
							.replace("{{text}}", res.message[i].text);
						
						wrapper.eq(i).find(".note-loop").append(markup);
						wrapper.eq(i).find("h2.title").html(app.layout.page.main.count(wrapper.eq(i)));

					};
				};
			}
		});
	};


	app.layout.page.logout = function(){
		return app.behavior.init(this.route);
	};

	app.layout.page.login = function(){
		var page = this;
		var register = app.select.item(".module.register");
		if (register.length) register.fadeOut(app.config.fade, function(){ $(this).remove() });
		return page.body.append(page.template).find(app.select.item(".module.login")).css({
			"margin-top" : -((app.select.item(".module.login").height() + 50) / 2)
		}).fadeIn(app.config.fade, function(){
			return app.behavior.init(page.route);
		});
	};

	app.layout.page.register = function(){
		var page = this;
		var login = app.select.item(".module.login");
		if (login.length) login.fadeOut(app.config.fade, function(){ $(this).remove() });	
		return page.body.append(page.template).find(app.select.item(".module.register")).css({
			"margin-top" : -((app.select.item(".module.register").height() + 50) / 2)
		}).fadeIn(app.config.fade, function(){
			return app.behavior.init(page.route);
		});
	};

})();