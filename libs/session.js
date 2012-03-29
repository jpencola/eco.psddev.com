var e = require("./debug");

module.exports = function(){

	var message;

	if (arguments.length === 0) {
		message = e("Session", "Argument undefined", "Error", arguments);
	};
		
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] !== "function") {

			if (arguments[0] === undefined || arguments[1] === undefined || arguments[2] === undefined) {
				message = e("Session", "Argument undefined", "Error", "0: " + arguments[0] + " , 1: " + arguments[1] + " , 3: " + arguments[2]);
			} else {
				arguments[0].session[arguments[1]] = arguments[2];
				message = e("Session", "Session is now set!", "Success", arguments[0].session[arguments[1]]);
			};

		} else {
			return arguments[i](message); 	
		};
	};
		
};
