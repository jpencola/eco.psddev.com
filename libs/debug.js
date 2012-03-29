module.exports = function(){
	
	if (arguments.length === 0)
		return false;
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] !== "function") 
			return {
				"type" : (arguments[0] || "No error type was given."),
				"message" : (arguments[1] || "No error message was given."),
				"status" : (arguments[2] || "No error status was given."),
				"code" : (arguments[3] || 0)
	  		};
	  	return arguments[i]();
	};
	
};