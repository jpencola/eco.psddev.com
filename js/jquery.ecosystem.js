// jQuery Perfect Sense Eco System
// A simple plugin to interact with a very specific UI
// Version 1.0.1
// by Erik Zettersten

LOCAL_STORAGE = store.get("notes") || {};

(function ($) {
    $.ecosystem = function (options) {

        var defaults = {
			"fullScreenToggle" : "> a",
			"wrapperNode" : "#wrapper",
			"applicationNode" : "#application",
			"centerNode" : "#me",
			"categoryNode" : "#categories",
			"noteNode" : "#notebox",
			"saveNote" : "a.note-submit",
			"noteToggle" : ".data-items li",
			"categoryQuaters" : "ul.quarter-select li > a",
			"categoryTags" : "ul.toggle-list li > a",
			"toResize" : ["#application", "#sections section"],
			"categories" : ["cat-bi", "cat-ci", "cat-qo", "cat-cl"],
			"noteCategories" : {}
		}, eco = this, base_ecosystem = {
			init: function () {
				
				base_ecosystem.listeners();
				if (store.get("user") != undefined && store.get("user") != '') {
					var username = store.get("user");
					var year = store.get("year");
					base_ecosystem.meta(username, year);
					base_ecosystem.populate();
				} else {
					
					base_ecosystem.selector.wrapper_element.parent("body").addClass("new-user");
					$("#new .form input[type=submit]").click(function(){
							var username = $(this).parent().find("input[type=text]").val();
							var year = new Date();

							year = year.getFullYear();

							if (username != '') {
								base_ecosystem.meta(username, year);
								base_ecosystem.populate();
								store.set("user", username);
								store.set("year", year);
							};
							
							$("#new").fadeOut("fast", function(){
								$(this).parent().removeClass("new-user");
							})
					});
				}
			},
			selector: {
				// to access, use: base_ecosystem.selector
				window_element : $(window),
				user_element : $(defaults.centerNode),
				catagory_element : $(defaults.categoryNode),
				category_module_element : $(defaults.categoryNode).find("> a"),
				application_element : $(defaults.applicationNode),
				wrapper_element : $(defaults.wrapperNode),
				sections : $(defaults.toResize[1]),
				section_titles : $(defaults.toResize[1] + defaults.fullScreenToggle),
				category_tags : $(defaults.categoryTags),
				note_element : $(defaults.noteNode),
				category_quarters : $(defaults.categoryQuaters),
				save_note : $(defaults.saveNote),
				note_toggle : $(defaults.noteToggle)
			},
			listeners: function () {
				base_ecosystem.method.resizeEcosystem();
				base_ecosystem.selector.window_element.resize(function () {
					base_ecosystem.method.resizeEcosystem();
				});
				
				// 1.0 watching for main overlay click
				base_ecosystem.selector.user_element.live("click", function () {
					base_ecosystem.method.showOverlay($(this));
					base_ecosystem.selector.note_element.empty().removeClass("active");
				});
				
				// 1.4 watching for categorie tag toggles
				base_ecosystem.selector.category_tags.live("click", function () {
					base_ecosystem.method.toggleTag($(this));
				});
				
				// 1.7 watching for quater toggles
				base_ecosystem.selector.category_quarters.live("click", function () {
					base_ecosystem.method.toggleQuater($(this));
				});
				
				// 1.1 watching for main overlay mouseleave
				base_ecosystem.selector.catagory_element.mouseleave(function () {
					base_ecosystem.method.hideOverlay($(this));
				});
				
				// 1.2 watching for clicks category modules
				base_ecosystem.selector.category_module_element.live("click", function () {
					base_ecosystem.method.addNote($(this));
					base_ecosystem.selector.note_element.focus();
				});
				
				// 1.5a - toggle full screen
				base_ecosystem.selector.section_titles.toggle(function () {
					base_ecosystem.method.toggleFullScreen(true, $(this));
					base_ecosystem.method.resizeEcosystem();
				}, function () {
					base_ecosystem.method.toggleFullScreen(false, $(this));
					base_ecosystem.method.resizeEcosystem();
				});
				
				// 1.5b toggle full screen (with home link)
				$("h1 > a, a.revert, .cancel, .close").live("click", function () {
					base_ecosystem.selector.wrapper_element.attr("class", "");
					base_ecosystem.method.resizeEcosystem();
					base_ecosystem.selector.note_element.empty().removeClass("active");
				});
				
				// 1.6 watch for save note click
				base_ecosystem.selector.save_note.live("click", function () {
					base_ecosystem.method.saveNote($(this));
				});
				
				// 1.7 watch for note toggle
				base_ecosystem.selector.note_toggle.live("click", function () {
					base_ecosystem.method.toggleNote($(this));
				});
				
				// 1.8 watch for note .edit click
				base_ecosystem.selector.note_toggle.find("a.edit").live("click", function () {
					var $this = $(this).parent().parent(),
						edit = {
							"title" : $this.parent().parent().find("> a").text(),
							"date" : $this.find(".time").text(),
							"id" : $this.attr("data-id"),
							"topics" : $this.find("ol li"),
							"quarters" : $this.find("ul li"),
							"text" : $this.find("p.note").text()
						};
					base_ecosystem.method.createInput("", edit)
				});
				
				// 1.9 export json
				$("li.exports > a").live("click", function () {
					base_ecosystem["export"]("json", $(this));
				});
				
			},
			populate : function () {
				// get data, hide loaders
				var data = LOCAL_STORAGE,
					html = "",
					index = null,
					i = "",
					bits,
					truncate = function (str, limit) {
						bits = str.split('');
						if (bits.length > limit) {
							for (i = bits.length - 1; i > -1; --i) {
								if (i > limit) {
									bits.length = i;
								} else if (' ' === bits[i]) {
									bits.length = i;
									break;
								}
							}
							bits.push('...');
						}
						return bits.join('');
					};
				
				$.each(data, function(){
					var q = "",
						c = "";
						
					for (i = this.quarter.length - 1; i >= 0; i--) {
						q += "<li class=\"" + this.quarter[i] + "\">" + this.quarter[i] + "</li>";
					}

					for (i = this.category.length - 1; i >= 0; i--) {
						c += "<li>" + this.category[i] + "</li>";
					}
					
					html = '<li class="' + this.quarter[0] + '" data-id="' + this.id + '"><a href="javascript:;">' + truncate(this.text, 35) + '</a><div class="data-info"><a href="#" class="edit">Edit</a><small class="time">' + this.date + '</small><p class="note">' + this.text + '</p><ul>' + q + '</ul><ol>' + c + '</ol></div></li>';
					switch (this.topic) {
					case "cat-bi":
						index = 0;
						break;
					case "cat-ci":
						index = 1;
						break;
					case "cat-qo":
						index = 2;
						break;
					case "cat-cl":
						index = 3;
						break; 
					}
					base_ecosystem.selector.sections.find("> .data-items").eq(index).append(html);
				});
				
			},
			meta : function (username, year) {
				$(".user:eq(0), #me h1").text(username);
				$(".year").eq(0).text(year);
			},
			method : {
				store : function (note, callback) {
					LOCAL_STORAGE[note.id] = note;
					store.set("notes", LOCAL_STORAGE);
					return callback();
				},
				checkCategory : function(){
					// TBD
				},
				buildNode : function(){
					// TBD
				},
				createInput : function (note, edit) {
					if (edit === undefined) {
						var getCurrentDate = new Date(),
							noteDate = (getCurrentDate.getMonth() + 1) + "/" + getCurrentDate.getDate() + "/" + store.get("year"),
							noteTitle,
							noteCategories,
							noteDataCat = note.attr("data-category"),
							temp = "",
							i,
							html;

						switch (noteDataCat) {
						case "cat-bi":
							noteTitle = "Business Intelligence";
							noteCategories = defaults.noteCategories[0];
							break;
						case "cat-ci":
							noteTitle = "Creativity & Innovation";
							noteCategories = defaults.noteCategories[1];
							break;
						case "cat-qo":
							noteTitle = "Quality & Ownership";
							noteCategories = defaults.noteCategories[2];
							break;
						case "cat-cl":
							noteTitle = "Communication & Leadership";
							noteCategories = defaults.noteCategories[3];
							break; 
						} 

						for (i = noteCategories.length - 1; i >= 0; i--) {
							temp += "<li><a href=\"#\">" + noteCategories[i] + "</a></li>";
						}
						
						html = '<h2 data-note-title="' + noteDataCat + '">' + noteTitle + '</h2><small data-note-date="' + noteDate + '" class="date">' + noteDate + '</small><ul class="quarter-select"><li><a href="#q1">Q1</a></li><li><a href="#q2">Q2</a></li><li><a href="#q3">Q3</a></li><li><a href="#q4">Q4</a></li><li class="shadow"></li></ul><textarea class="note-area"></textarea><ul class="toggle-list">' + temp + '</ul><div class="note-action"><a href="#" class="note-submit">Save!</a><a href="#" class="cancel">Cancel</a></div>';
						base_ecosystem.selector.note_element.append(html);
					} else {
						
						$("[data-id=" + edit.id + "]").addClass("editing");	
						
						var topics = "";
						$.each(edit.topics, function(){	
							topics += "<li><a href=\"#\">" + $(this).text() + "</a></li>";
						});

						var html = html = '<h2 data-note-title="' + edit.cat + '">' + edit.title + '</h2><small data-note-date="' + edit.date + '" class="date">' + edit.date + '</small><ul class="quarter-select"><li><a href="#q1">Q1</a></li><li><a href="#q2">Q2</a></li><li><a href="#q3">Q3</a></li><li><a href="#q4">Q4</a></li><li class="shadow"></li></ul><textarea class="note-area">' + edit.text + '</textarea><ul class="toggle-list">' + topics + '</ul><div class="note-action"><a href="#" class="note-submit">Save!</a><a href="#" class="cancel">Cancel</a></div>';
						base_ecosystem.selector.note_element.addClass("active");
						
						$("[data-id=" + edit.id + "]").remove();
						base_ecosystem.selector.note_element.append(html);
						
						
					}	
				},
				toggleTag : function (i) {
					i.toggleClass("active");
				},
				toggleQuater : function (i) {
					i.toggleClass("active");
				},
				toggleNote : function (i) {
					i.toggleClass("active");
				},
				placeNote : function (note, callback) {
					
					var q = "",
						c = "",
						i,
						bits,
						html,
						truncate;
						
					for (i = note.quarter.length - 1; i >= 0; i--) {
						q += "<li class=\"" + note.quarter[i] + "\">" + note.quarter[i] + "</li>";
					}
					
					for (i = note.category.length - 1; i >= 0; i--) {
						c += "<li>" + note.category[i] + "</li>";
					}
					
					truncate = function (str, limit) {
						bits = str.split('');
						if (bits.length > limit) {
							for (i = bits.length - 1; i > -1; --i) {
								if (i > limit) {
									bits.length = i;
								} else if (' ' === bits[i]) {
									bits.length = i;
									break;
								}
							}
							bits.push('...');
						}
						return bits.join('');
					};
					
					html = '<li class="' + note.quarter[0] + '" data-id="' + note.id + '"><a href="javascript:;">' + truncate(note.text, 35) + '</a><div class="data-info"><a href="#" class="edit">Edit</a><small class="time">' + note.date + '</small><p class="note">' + note.text + '</p><ul>' + q + '</ul><ol>' + c + '</ol></div></li>';
								
					$("a[data-category='" + note.topic + "']").parent().find(".data-items").append(html);
				},
				saveNote : function (i) {
					var p = i.parents("#notebox"),
						c = p.find(".toggle-list a.active"),
						q = p.find(".quarter-select a.active"),
						n = p.find(".note-area").val(),
						d = p.find("[data-note-date]").text(),
						t = p.find("[data-note-title]").attr("data-note-title"),
						ca = [],
						uid = new Date(),
						qa = [];
					
						
					$.each(c, function (index) {
						ca.push($(this).text());
					});
					
					$.each(q, function (index) {
						qa.push($(this).text());
					});
					
					var note = {
						"id" : uid.getTime(),
						"text" : n,
						"quarter" : qa,
						"category" : ca,
						"topic" : t,
						"date" : d,
						"year" : store.get("year")
					}, 
					
					error = note.text.length && qa.length && ca.length;
					

					if (error) {
						base_ecosystem.method.store(note, function () {
							base_ecosystem.method.placeNote(note);
							base_ecosystem.selector.note_element.empty().removeClass("active");
						}); 
					} else {
						base_ecosystem.selector.note_element.find(".error").slideUp();
						error = "<p class=\"error\">Please make sure you have atleast 1 topic, 1 quarter, and some text filled in to continue!</p>"
						base_ecosystem.selector.note_element.append(error);
					};
					
				},
				showOverlay : function (i) {
					i.addClass("animate");
					base_ecosystem.selector.catagory_element.addClass("animate");
					return false;
				},
				hideOverlay : function (i) {
					i.removeClass("animate");
					base_ecosystem.selector.user_element.removeClass("animate");
					base_ecosystem.method.removeSelection();
					return false;
				},
				addNote : function (i) {
					base_ecosystem.method.toggleSelection(i.attr("data-category"));
					base_ecosystem.selector.note_element.empty().removeClass("active");
					
					if (!base_ecosystem.selector.note_element.hasClass("active")) {
						base_ecosystem.selector.note_element.addClass("active");
						base_ecosystem.method.createInput(i);
					}
					
					base_ecosystem.selector.catagory_element.removeClass("animate");
					return false;
				},
				removeSelection : function () {
					// remove all instances of "isSelected"
					base_ecosystem.selector.section_titles.removeClass("isSelected");
					return false;
				},
				toggleSelection : function (categoryType) {
					base_ecosystem.method.removeSelection();
					var i;
					for (i = defaults.categories.length - 1; i >= 0; i--) {
						if (defaults.categories[i] === categoryType) base_ecosystem.selector.section_titles.eq(i).addClass("isSelected");
					}
				},
				resizeEcosystem : function () {
					return $.each(defaults.toResize, function (i) {
						var application_height = $(defaults.applicationNode).height();
						$(defaults.toResize[i]).css({
							"height" : (i <= 0) ? ($(window).height() - 100) : (base_ecosystem.method.isFullScreen()) ? application_height : (application_height / 2)
						});
					});
				},
				isFullScreen : function () {
					// returns true is toggleSelection is active
					return base_ecosystem.selector.wrapper_element.hasClass(defaults.categories[0]) || base_ecosystem.selector.wrapper_element.hasClass(defaults.categories[1]) || base_ecosystem.selector.wrapper_element.hasClass(defaults.categories[2]) || base_ecosystem.selector.wrapper_element.hasClass(defaults.categories[3]);
				},
				toggleFullScreen : function (e, i) {
					return (e) ? base_ecosystem.selector.wrapper_element.addClass("active show-" + i.attr("data-category") + " " + i.attr("data-category")) : base_ecosystem.selector.wrapper_element.attr("class", "");
				}
			}, 
			export : function(type, i){
			
				var $this = i || null, 
					notes = store.get("notes") || null,
					name  = store.get("user")  || null,
					year  = store.get("year")  || null,
					save_view;

				if (notes != null) {

					switch(type){
						case "json" || "JSON" || "js":
							notes = window.ecoexport(notes, name, year);
						break;
					};

					var style = "*{list-style:none;font-size:12px;font-family:helvetica, arial, sans-serif;text-align:left;font-weight:400;margin:0;padding:0}body{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpiZGBg4GegImAB4v9A/J0ItZxA/ImQIiYGKoNRA0cNJAMwUjungAAfNdWNxvKogYPBQIAAAwDYVQNS9ezIkwAAAABJRU5ErkJggg==) repeat scroll 0 0 transparent}#wrapper{width:1024px;background:#fefefe;border:1px solid #ddd;box-shadow:1px 1px 3px #ccc;margin:25px auto}table{border:none;border-collapse:collapse;width:100%}table thead{background:#333}table th{font-weight:700;font-size:18px;color:#fff;padding:15px}table tr{border-bottom:1px solid #ddd}table tr.alt{background:#efefef}table td{border-right:1px solid #ccc;line-height:19px;padding:5px 15px}table td ul{margin:10px 0}table td ul li{list-style:outside;margin:0 0 0 10px}";

					save_view = window.open("", "print", "scrollbars=1,status=0,width=1024,height=720");
					save_view.document.write("<!DOCTYPE HTML><html><head><title>Export to JSON</title><style>"+ style +"</style></head><body>"+ notes +"</body></html>");
					save_view.document.close();
					save_view.focus();

				};

			}
		};

		eco.init = function () {
			$.extend(defaults, options);
			base_ecosystem.init();
		};

		// initialize once
		return eco.init();

    };

    $.fn.ecosystem = function (options) {

        return this.each(function () {
            if (undefined === $(this).data('ecosystem')) {
                var eco = new $.ecosystem(this, options);
                $(this).data('ecosystem', eco);
            }
        });

    };

})(jQuery);


