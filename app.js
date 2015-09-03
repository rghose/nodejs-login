var server_port = 8000;
var backend_url = "http://localhost:8123";
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var request = require('request');

var app = express();

// http://stackoverflow.com/questions/5710358/how-to-get-post-a-query-in-express-js-node-js
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
}));

// For session maintanence
app.use(cookieParser());
app.use(session({secret: 'flywheel'}));

// Load static files from this directory
app.use(express.static('public'));

app.set('views', './views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
	var sess=req.session;
	if(!sess.user_email) {
		res.redirect("/login");
		return
	}
	var name = sess.user_name;
	var email = sess.user_email;
	var type = sess.user_type;
	res.render('home.html', {email: email,user:name,type:type} );
});

// Handle login
app.get('/login', function(req,res) {
	res.render('login.html');
});

// Handle logout
app.get('/logout',function(req,res) {
	req.session.destroy(function(err){
		if(err) {
			console.log(err);
		} else {
		res.redirect('/');
		}
	});
});

// Authentication request
app.post('/login', function(req,res) {
	var username = req.body.username;
	var password = req.body.password;
	request.post({url:backend_url+"/login", form: {user:username,pass:password}},function(err,httpResponse,body){
		if(err) {
			res.send("And error occured:" + err.code);
			return;
		}
		response_json = JSON.parse(body);
		console.log('#'+response_json["status"]);
		if(httpResponse.statusCode == 200 && response_json['status']=="OK") {
		  req.session.user_email = username;
			req.session.user_type = response_json['type'];
			req.session.user_name = response_json['name'];
			res.redirect('/');
		}
		else {
			res.send("Authentication failed.");
		}
	});
});

var server = app.listen(server_port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
