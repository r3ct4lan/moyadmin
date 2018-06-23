const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const server = require('http').Server(app);
const url = require('url');
const fs = require('fs');
const randomstring = require("randomstring");
var formidable = require('formidable');
var ftpClient = require('ftp');
const ftp_config = require('./config/ftp.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

if (process.env.REDIS_URL) {
	var rtg   = url.parse(process.env.REDIS_URL);
	var client = require("redis").createClient(rtg.port, rtg.hostname);
	client.auth(rtg.auth.split(":")[1]);
} else {
	var client = require("redis").createClient();
}
client.on("error", function (err) {
	console.log("Redis error: " + err);
});

require('./app/routes')(server, client);
var port = process.env.PORT || 8000;
server.listen( port, () => {
	console.log('Server is running on port ' + port);
});

app.get('/titles', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/titles.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
			res.redirect('/');
		}
	});		
});

app.get('/sections', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/sections.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
			res.redirect('/');
		}
	});		
});

app.get('/section', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/section.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
			res.redirect('/');
		}
	});		
});

app.get('/articles', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/articles.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
	   		res.redirect('/');
		}
	});		
});

app.get('/edit', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/edit.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
			res.redirect('/');
		}
	});		
});

app.post('/icon-upload', ( req, res, next ) => {
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
	    var oldpath = files.file.path;
		var newpath = __dirname + '\\ftpTemp\\' + files.file.name;
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			var ftp = new ftpClient();
			ftp.connect(ftp_config);
			ftp.on('ready', () => {
				ftp.put(newpath, './moydvgups.ru/www/img/icons/'+files.file.name, err => {
					if (err) console.log(err);
					else fs.unlinkSync(newpath);
					ftp.end();
				});
			});
			res.writeHead(200);
			res.end();
		});
	});
});

app.post('/backgr-upload', ( req, res, next ) => {
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
	    var oldpath = files.file.path;
		var newpath = __dirname + '\\ftpTemp\\' + files.file.name;
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			var ftp = new ftpClient();
			ftp.connect(ftp_config);
			ftp.on('ready', () => {
				ftp.put(newpath, './moydvgups.ru/www/img/backgrounds/'+files.file.name, err => {
					if (err) console.log(err);
					else fs.unlinkSync(newpath);
					ftp.end();
				});
			});
			res.writeHead(200);
			res.end();
		});
	});
});

app.get('/', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/homepage.html');
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		} else {
			var page = fs.readFileSync('public/login.html');
	   		res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		}
	});
});

app.post('/', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	if (username && password) {
		client.get("users", function(err, result) {
			if (result) {
				result = JSON.parse(result);
				for (var i = 0; i<result.users.length; i++) {
					if (result.users[i].login == username && result.users[i].password == password) {
						var newId = randomstring.generate(23);
						var page = fs.readFileSync('public/homepage.html');
						res.cookie("moydvgups_admin_id", newId);
						res.cookie("username", username);
	   					res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(page);
						client.get("active_id", function(err, result) {
							if (result) {
								result = JSON.parse(result);
								var j = 0;
								if (result.active_id.length) {
									do {
										if (Date.now() - result.active_id[j].date > 60000) {
											result.active_id.splice(j, 1);
											j--;
										}
										j++;
									} while (j<result.active_id.length);
								}
								result.active_id[result.active_id.length] = { "id": newId, "date": Date.now() };
								result = JSON.stringify(result);
								client.set("active_id", result);
							} else {
								console.log("Redis error: " + err);
							}
						});
						break;
					}
				}
			} else {
				console.log("Redis error: " + err);
			}
		});
	}
});

function checkUser (request, callback) {
	var rc = request.cookies['moydvgups_admin_id'];
	client.get("active_id", function(err, result) {
		if (result) {
			result = JSON.parse(result);
			var temp = false;
			var j = 0;
			if (result.active_id.length) {
				do {
					if (result.active_id[j].id == rc) {
						temp = true;
						result.active_id[j].date = Date.now();
					}
					if (Date.now() - result.active_id[j].date > 60000) {
						result.active_id.splice(j, 1);
						j--;
					}
					j++;
				} while (j<result.active_id.length);
			}
			callback(temp);
			result = JSON.stringify(result);
			client.set("active_id", result);
		} else {
			console.log("Redis error: " + err);
		}
	});
}