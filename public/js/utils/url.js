(function(){

	// Define the internal url variable
	var url = {};

	if (typeof module !== "undefined" && module.exports)
		module.exports = url;
	else
		this.url = url;

	// url version
	url.version = "0.0.1";

	// url utils
	url.getKey = function getKey(input, src) {
    	var match = RegExp('[?&]' + input + '=([^&]*)').exec(src || window.location.search);
    	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};

	url.makeSlug = function makeSlug(input, type) {
        return input
        		.replace(/'|"/g, '')
        		.replace(/([a-z\d])([A-Z])/g, '$1-$2')
                .replace(/\W+/g, !type ? '-' : '_')
                .toLowerCase();	
	};

	url.getSrc = function getSources(input){
		for (var i = 0, results = [], items = document.getElementsByTagName(input || "script"); i < items.length; i++) {
			var check = items[i].getAttribute(input === "a" ? "href" : "src");
			if (check !== null) {
				results.push(check);
			};
		};
		return results;
	};

	url.contains = function contains(input, type){
		var src = this.getSrc(type || "script");
		var result;
		for (var i = 0; i < src.length; i++) {
			if (src[i].indexOf(input || "") != -1)
				result = src[i];
		};
		return result;
	};

})();