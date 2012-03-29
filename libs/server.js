function startup(config) {
  
  console.log('Server listening on ' + config.port);
  
  process.on("exit", function() {
    console.log("Shutdown Server.");
  });

  process.on("SIGINT", function() {
    console.log("Server interupted.");
    process.exit(0);
  });
  
};

module.exports = function(config) {
  startup(config);
};

