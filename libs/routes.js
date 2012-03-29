var db = new (require("cradle").Connection)().database("ecosystem");
var b = require("bcrypt");
var slang = require("slang");
var e = require("./debug");
var schema = require("./user");
var s = require("./session");
var config = require("./../config");

module.exports = function(app){

  app.get("/", function(req, res){
    var page = {};
    page.version = config.version;
    if (req.session.authenticated) {
      var EMAIL = req.session.email;
      return db.get(EMAIL, function(err, doc){
        if (err)
          return res.json(e("Home", "There was an error with the database.", "error"));
        page.name = doc.name;
        page.revision = doc._rev;
        page.email = doc._id;
        page.title = "Home";
        page.authenticated = true;
        res.render("index.jade", page);
      });
    } else {
      page.name = "";
      page.revision = "";
      page.email = "";
      page.title = "Login";
      page.authenticated = false;
      res.render("auth.jade", page);
    };
  });

  // Logout
  app.get("/_api/logout", function(req, res){

    // Is the user not logged in or already logged out?
    if (req.session.authenticated === undefined || req.session.authenticated === false)
      return res.json(e("Logout", "You weren't logged in...", "error"));

    // Set three session variables to false
    return s(req, "authenticated", false, function(message){

      // Set email session variable
      return s(req, "email", null, function(message) {

        // Set role to null if its there.
        if (req.session.role !== undefined)
          return s(req, "role", null, function(message) {
            return res.json(e("Logout", "You (ADMIN) have successfully logged out.", "success"));  
          });

        return res.json(e("Logout", "You have successfully logged out.", "success"));

      });

    });

  });

  // Register
  app.post("/_api/register", function(req, res){

    var EMAIL = req.body.email.toLowerCase();
    var PASSWORD = req.body.password;
    var CON_PASSWORD = req.body.cpassword;
    var NAME = slang.capitalizeWords(req.body.name);
    
    // Did the use fill all the feilds out?
    if (EMAIL === undefined || PASSWORD === undefined || NAME === undefined || NAME === "" || PASSWORD === "" || EMAIL === "")
      return res.json(e("Register", "Your email, password, or name was not filled out. Please Try again.", "error"));
    
    // Confirm password
    if (PASSWORD !== CON_PASSWORD)
      return res.json(e("Register", "Please make sure your 'confirm password' field matches the 'password' field", "error"));

    if (!EMAIL.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
      return res.json(e("Register", "Your email was invalid. Please try again.", "error"));

    // Check if user is already registerd
    return db.get(EMAIL, function(err, doc){
      if (!err)
        return res.json(e("Register", "Your email is already in use. Please login, or choose a different email.", "error", err));
      else
        return b.gen_salt(10, function(salt_error, salt) {
          // generate encrypted password
          if (salt_error)
            return res.json(e("Register", "There was a server error", "error", salt_error))
          else
            return b.encrypt(PASSWORD, salt, function(encrypt_err, hash) {
              if (encrypt_err)
                return res.json(e("Register", "There was a server error", "error", encrypt_err))
              
              // save data w/ schema and new hash password to database
              schema.name = NAME;
              schema.password = hash;
            
              return db.save(EMAIL.toLowerCase(), schema, function(db_error, save_res){
                
                if (db_error)
                  return res.json(e("Register", "There was a problem with the database.", "error", db_error));

                // Issue a message to the client.
                return res.json(e("Register", "Thanks, " + NAME + "! You have successfully registered. Go ahead and login!", "success"));
              });
          });
        });
    });

  });

  // Delete
  app.post("/_api/register/:email", function(req, res){
    
    var EMAIL = req.params.email.toLowerCase();

    // Make sure you're an admin
    if (req.session.role !== 1)
      return res.json(e("Delete", "You do not have sufficent privileges to delete a user.", "error"));
    
    // Cannot post a blank user
    if (EMAIL === undefined || EMAIL === "")
      return res.json(e("Delete", "The ID was not specified or undefined", "error"));
    
    // Make sure its an email
    if (!EMAIL.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
      return res.json(e("Delete", "Your email was invalid. Please try again.", "error"));

    // Cannot delete yourself
    if (EMAIL === req.session.email)
      return res.json(e("Delete", "You cannot delete yourself.", "error"));
    
    // Make sure the user exsists
    db.get(EMAIL, function(err, doc){
      
      if (err)
        return res.json(e("Delete", "There was an error with the database.", "error"));

      // Cannot find user in database
      if (doc._rev === undefined || doc._rev === "")
        return res.json(e("Delete", "The document revision was not found.", "error"));
      
      // Remove user
      return db.remove(EMAIL, doc._rev, function(rm_err, rm_res){
        
        if (rm_err)
          return res.json(e("Delete", "There was an error removing document.", "error"));

        return res.json(e("Delete", EMAIL + " was successfully removed.", "success"));
      });
      
    });

  });
  
  // Login 
  app.post("/_api/login", function(req, res){

    var EMAIL = req.body.email.toLowerCase();
    var PASSWORD = req.body.password;

    if (PASSWORD === undefined || EMAIL === undefined)
      return res.json(e("Login", "Your password or email was undefined.", "error"));

    // Make sure its an email
    if (!EMAIL.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
      return res.json(e("Login", "Your email was invalid. Please try again.", "error"));

    db.get(EMAIL, function(err, doc){

        // Check email with database
        if (err)
          return res.json(e("Login", "Your email was not found. Please try again or register.", "error", err));
        
        // Check password against encrypted data
        b.compare(PASSWORD, doc.password, function(error, password_result){

          if (error)
            return res.json(e("Login", "There was a problem encrypt comparing your password.", "error", error));
          
          // Check password comparison and the posted email
          if (password_result && EMAIL === doc._id)
            return s(req, "authenticated", true, function(message){
              return s(req, "email", EMAIL, function(message){
                if (doc.role === 1)
                  return s(req, "role", doc.role, function(message){
                    // Send message to client
                    return res.json(message);
                  });
                else 
                  return res.json(message);
              });    
            });

          // Incorrect password or email
          return res.json(e("Login", "Your password or email was incorrect. Please try again.", "error"));
        });
    });

  });
  
  // Get all topics 
  app.get("/_api/topics", function(req, res){

    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Topics", "Please login to view or edit topics", "error"));

    db.get(EMAIL, function(err, doc){
      if (err)
        res.json(e("Topics", "There was an error getting all topics", "error", err));

      return res.json(e("Topics", doc.topics, "success"));
    });

  });

  // Create Topic
  app.post("/_api/topics", function(req, res){

    var EMAIL = req.session.email;
    var VALUE = slang.trim(slang.capitalizeWords(req.body.value.toLowerCase()));

    if (VALUE === undefined || VALUE === "")
      return res.json(e("Topics", "Please enter a value to save.", "error"));

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Topics", "Please login to view or edit topics", "error"));

    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Topics", "There was an error in the database.", "error", err));

      for (var i = 0; i < doc.topics.length; i++)
        if (slang.trim(slang.capitalizeWords(doc.topics[i].toLowerCase())) === VALUE)
          return res.json(e("Topics", "There is already a topic with that value.", "error"))

      var REVISION = doc._rev;
      doc.topics.push(VALUE);

      return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
        
        if (save_err)
          return res.json(e("Topics", "There was an error saving a topic.", "error"));

        return res.json(e("Topics", "You have saved " + VALUE + "!", "success"));

      });

    });

  });

  // Get a topic 
  app.get("/_api/topics/:topic", function(req, res){

    var TOPIC = parseInt(req.params.topic); 
    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Topics", "Please login to view or edit topics", "error"));

    if (TOPIC === undefined || TOPIC === "")
      return res.json(e("Topics", "You did not provide a name or it is undefined.", "error"));
      
    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Topics", "There was an error in the database.", "error", err));

      if (doc.topics[TOPIC] === "" || doc.topics[TOPIC] === undefined)
        return res.json(e("Topics", "No such topic.", "error"));
      
      return res.json(e("Topics", doc.topics[TOPIC], "success"));

    });

  });

  // Save or Delete a topic 
  app.post("/_api/topics/:topic", function(req, res){

    var TOPIC = parseInt(req.params.topic); 
    var EMAIL = req.session.email;
    var METHOD = req.body.method;

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Topics", "Please login to view or edit topics", "error"));

    if (TOPIC === undefined || TOPIC === "")
      return res.json(e("Topics", "You did not provide a name or it is undefined.", "error"));

    if (METHOD === undefined || METHOD === "")
      return res.json(e("Topics", "A method was not specified. Please use 'post' or 'delete'.", "error"));

    if (METHOD === "save")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Topics", "There was an error in the database.", "error", err));

        var REVISION = doc._rev;
        doc.topics[TOPIC] = req.body.value;

        if (REVISION === undefined)
          return res.json(e("Topics", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Topics", "There was an error saving changes.", "error", topics));

          return res.json(e("Topics", "You saved " + doc.topics[TOPIC] + " at topic " + TOPIC, "success"));
          
        });
        
      });
    
    if (METHOD === "delete")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Topics", "There was an error in the database.", "error", err));

        if (doc.topics[TOPIC] === "" || doc.topics[TOPIC] === undefined)
          return res.json(e("Topics", "No such topic.", "error"));

        var REVISION = doc._rev;
        doc.topics.splice(TOPIC, 1);

        if (REVISION === undefined)
          return res.json(e("Topics", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Topics", "There was an error saving changes.", "error", topics));

          return res.json(e("Topics", "You deleted topic " + TOPIC, "success"));
          
        });
    });

  });

  // Get all categories
  app.get("/_api/categories", function(req, res){

    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Categories", "Please login to view or edit categories", "error"));

    db.get(EMAIL, function(err, doc){
      if (err)
        res.json(e("Categories", "There was an error getting all categories", "error", err));

      return res.json(e("Categories", doc.categories, "success"));
    });

  });

  // Get a category
  app.get("/_api/categories/:category", function(req, res){

    var CATEGORY = parseInt(req.params.category); 
    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Categories", "Please login to view or edit categories", "error"));

    if (CATEGORY === undefined || CATEGORY === "")
      return res.json(e("Categories", "You did not provide a name or it is undefined.", "error"));
      
    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Categories", "There was an error in the database.", "error", err));

      if (doc.categories[CATEGORY] === "" || doc.categories[CATEGORY] === undefined)
        return res.json(e("Categories", "No such category.", "error"));
      
      return res.json(e("Categories", doc.categories[CATEGORY], "success"));
    
  });

  });

  // Save / Delete a category
  app.post("/_api/categories/:category", function(req, res){

    var CATEGORY = parseInt(req.params.category); 
    var EMAIL = req.session.email;
    var METHOD = req.body.method;

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Categories", "Please login to view or edit categories", "error"));

    if (CATEGORY === undefined || CATEGORY === "")
      return res.json(e("Categories", "You did not provide a name or it is undefined.", "error"));

    if (METHOD === undefined || METHOD === "")
      return res.json(e("Categories", "A method was not specified. Please use 'post' or 'delete'.", "error"));

    if (METHOD === "save")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Categories", "There was an error in the database.", "error", err));

        var REVISION = doc._rev;
        doc.categories[CATEGORY] = req.body.value;

        if (REVISION === undefined)
          return res.json(e("Categories", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Categories", "There was an error saving changes.", "error", categories));

          return res.json(e("Categories", "You saved " + doc.categories[CATEGORY] + " at category " + CATEGORY, "success"));
          
        });
        
      });
    
    if (METHOD === "delete")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Categories", "There was an error in the database.", "error", err));

        if (doc.categories[CATEGORY] === "" || doc.categories[TOPIC] === undefined)
          return res.json(e("Categories", "No such category.", "error"));

        var REVISION = doc._rev;
        doc.categories.splice(CATEGORY, 1);

        if (REVISION === undefined)
          return res.json(e("Categories", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Categories", "There was an error saving changes.", "error", categories));

          return res.json(e("Categories", "You deleted category " + CATEGORY, "success"));
          
        });
    });

  });

  // Create category
  app.post("/_api/categories", function(req, res){

    var EMAIL = req.session.email;
    var VALUE = slang.trim(slang.capitalizeWords(req.body.value.toLowerCase()));

    if (VALUE === undefined || VALUE === "")
      return res.json(e("Categories", "Please enter a value to save.", "error"));

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Categories", "Please login to view or edit categories", "error"));

    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Categories", "There was an error in the database.", "error", err));

      for (var i = 0; i < doc.categories.length; i++)
        if (slang.trim(slang.capitalizeWords(doc.categories[i].toLowerCase())) === VALUE)
          return res.json(e("Categories", "There is already a topic with that value.", "error"))

      var REVISION = doc._rev;
      doc.categories.push(VALUE);

      return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
        
        if (save_err)
          return res.json(e("Categories", "There was an error saving a topic.", "error"));

        return res.json(e("Categories", "You have saved " + VALUE + "!", "success"));

      });

    });

  });

  // Get all notes
  app.get("/_api/notes", function(req, res){
 
    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Notes", "Please login to view or edit notes", "error"));

    db.get(EMAIL, function(err, doc){
      if (err)
        res.json(e("Notes", "There was an error getting all notes", "error", err));

      return res.json(e("Notes", doc.notes, "success"));
    });
   
  });

  // Get a note
  app.get("/_api/notes/:note", function(req, res){

    var NOTE = parseInt(req.params.note); 
    var EMAIL = req.session.email;
    
    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Notes", "Please login to view or edit notes", "error"));

    if (NOTE === undefined || NOTE === "")
      return res.json(e("Notes", "You did not provide a name or it is undefined.", "error"));
      
    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Notes", "There was an error in the database.", "error", err));

      if (doc.notes[NOTE] === "" || doc.notes[NOTE] === undefined)
        return res.json(e("Notes", "No such category.", "error"));
      
      return res.json(e("Notes", doc.notes[NOTE], "success"));

    });
    
  });

  // Delete / Save note
  app.post("/_api/notes/:note", function(req, res){

    var NOTE = parseInt(req.params.note); 
    var EMAIL = req.session.email;
    var METHOD = req.body.method;

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Notes", "Please login to view or edit notes", "error"));

    if (NOTE === undefined || NOTE === "")
      return res.json(e("Notes", "You did not provide a name or it is undefined.", "error"));

    if (METHOD === undefined || METHOD === "")
      return res.json(e("Notes", "A method was not specified. Please use 'post' or 'delete'.", "error"));

    if (METHOD === "save")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Notes", "There was an error in the database.", "error", err));

        var REVISION = doc._rev;
        doc.notes[NOTE] = req.body.value;

        if (REVISION === undefined)
          return res.json(e("Notes", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Notes", "There was an error saving changes.", "error", notes));

          return res.json(e("Notes", "You saved " + doc.notes[NOTE] + " at note " + NOTE, "success"));
          
        });
        
      });
    
    if (METHOD === "delete")
      return db.get(EMAIL, function(err, doc){

        if (err)
          return res.json(e("Notes", "There was an error in the database.", "error", err));

        if (doc.notes[NOTE] === "" || doc.notes[TOPIC] === undefined)
          return res.json(e("Notes", "No such category.", "error"));

        var REVISION = doc._rev;
        doc.notes.splice(NOTE, 1);

        if (REVISION === undefined)
          return res.json(e("Notes", "There was a problem with your value or revision number", "error"));

        return db.save(EMAIL, REVISION, doc, function(save_err, save_res){
          
          if (save_err)
            return res.json(e("Notes", "There was an error saving changes.", "error", notes));

          return res.json(e("Notes", "You deleted note " + NOTE, "success"));
          
        });
    });

  });

  // Create note 
  app.post("/_api/notes", function(req, res){

    var EMAIL = req.session.email;
    var ID = new Date().getTime();
    var TEXT = req.body.text;
    var NAME = req.body.name;
    var TOPICS = req.body.topics;
    var PRIORITIES = req.body.priorities;
    var CATEGORY = req.body.category;

    if (EMAIL === undefined || EMAIL === null)
      return res.json(e("Notes", "Please login to view or edit notes", "error"));

    db.get(EMAIL, function(err, doc){

      if (err)
        return res.json(e("Notes", "There was an error in the database.", "error", err));

      return res.json(e("Notes", "nothing", "error", err));

    });
    
  });

  // Handles refresh on pages expexting no refresh - has to be last
  app.get("/*", function(req, res){
    res.redirect("/"); 
  });

};

