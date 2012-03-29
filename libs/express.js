module.exports.init = function(config){
  var express = require("express"); 
  module.exports.configure(express, config);
};

module.exports.configure = function(express, config){
  var app = module.exports = express.createServer();
  
  app.configure(function(){
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.cookieParser());
    app.use(express.session({ secret: "perfect08" }));
    app.use(express.static('public'));
    app.set("view_engine", "jade");
    app.set("views", "views");
  });

  // Set / to use routes
  app.use("/", express.router(require("./routes.js")));
  
  app.listen(config.port); 
};