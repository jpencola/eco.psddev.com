(function(){
	
	window.app = {};

	head.js(
		{ "util-jquery" : "js/utils/jquery.js" },
		{ "util-path" : "js/utils/path.js" },
		{ "util-slang" : "js/utils/slang.js" },
		{ "plugins-resize" : "js/plugins/jquery.smartresize.js" },
		{ "plugins-isotope" : "js/plugins/jquery.isotope.js" },
		{ "plugins-livequery" : "js/plugins/jquery.livequery.js" },
		{ "plugins-hotkeys" : "js/plugins/jquery.behavior.js" },
		{ "plugins-timeago" : "js/plugins/jquery.timeago.js" },
		{ "plugins-inputs" : "js/plugins/jquery.inputs.js" },
		{ "plugins-kinetic" : "js/plugins/jquery.kinetic.js" },
		{ "libs-select" : "js/libs/select.js" },
		{ "libs-debug" : "js/libs/config.js" },
		{ "libs-routes" : "js/libs/routes.js" },
		{ "libs-layout" : "js/libs/layout.js" },
		{ "libs-behavior" : "js/libs/behavior.js" },
		function(){ return app.init(); }
	);
	

	app.init = function(){
		app.isAuthed = app.select.item("html.eco-true").length ? true : false;
		app.routes();
	};

})();

