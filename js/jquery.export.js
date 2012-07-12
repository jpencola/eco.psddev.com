(function(){

	window.ecoexport = function(data, name, year){

		console.log(data);

		if (typeof data === "undefined") return alert("No data");

		var json = data;
		var count = 0;
		var tr = "";

		var table = [
			"<table>",
				"<thead>",
					"<tr>",
						"<th colspan=\"5\">{{person}} {{year}}</th>",
					"</tr>",
				"</thead>",
				"<tbody>",
					"{{iterator}}",
				"</tbody>",
			"</table>"
		].join("");

		$.each(json, function(){
			
			console.log(this)

			var tr_class = "";
			var tr_topics = "";
			var tr_quarters = "";
			var tr_category = "";

			if (count % 2) {
				tr_class = "class=\"alt\"";
			};

			var iterator = [
				"<tr "+ tr_class +">",
					"<td>{{date}}</td>",
					"<td>{{quarters}}</td>",
					"<td>{{text}}</td>",
					"<td>{{topics}}</td>",
					"<td>{{category}}</td>",
				"</tr>"
			].join("");

			for (var i = 0; i < this.category.length; i++) {
				tr_topics += "<li>"+ this.category[i] +"</li>";
			};

			for (var i = 0; i < this.quarter.length; i++) {
				tr_quarters += "<li>"+ this.quarter[i] +"</li>";
			};

			switch(this.topic) {
				case "cat-cl":
					tr_category = "Communication & Leadership";
					break;
				case "cat-qo":
					tr_category = "Quality & Ownership";
					break;
				case "cat-bi":
					tr_category = "Business Intelligence";
					break;
				case "cat-ci":
					tr_category = "Creativity & Innovation";
					break;
			};

			tr += iterator
				.replace("{{date}}", this.date)
				.replace("{{quarters}}", "<ul>" + tr_quarters + "</ul>")
				.replace("{{text}}", this.text)
				.replace("{{topics}}", "<ul>" + tr_topics + "</ul>")
				.replace("{{category}}", tr_category);

			count++;
		});

		var __export = table.replace("{{iterator}}", tr).replace("{{person}}", name).replace("{{year}}", year);
		return __export;

	};
})();