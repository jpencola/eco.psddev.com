Eco | Ecosystem App 0.2.2
=========================

Featuring an easy REST api to program against
---------------------------------------------

Sample jquery REST...

``` javascript

// logout
$.get("/_api/logout");

// login
$.post("/_api/login", data);

// register
$.post("/_api/register", data);

// delete user (must be admin)
$.post("/_api/register/:id");

// get all notes
$.get("/_api/notes");

// get a note
$.get("/_api/notes/:id");

// delete a note
$.post("/_api/notes/:id");

// get categories
$.get("/_api/categories");

```

Encrypted authentication and session manamgent
----------------------------------------------

Using bcrypt and express app sessions.


Async architechure 100% of the time
-----------------------------------

Everything is written in the async fashion... Awesome!

Author: Erik Zettersten @ http://zettersten.com
