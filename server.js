const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const server = require('http').Server(app);
const url = require('url');
const fs = require('fs');
const randomstring = require("randomstring");
const passwordHash = require("password-hash");
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

app.get('/profile', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			var page = fs.readFileSync('public/profile.html');
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

app.get('/registration', (req, res) => {
	checkUser(req, (result) => {
		if (result) {
			res.redirect('/');
		} else {
			var page = fs.readFileSync('public/registration.html');
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(page);
		}
	});
});

app.post('/registration', (req, res) => {
	const invite = req.body.invite;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;
	if (invite && username && password && password2) {
		if (password == password2) {
			client.get("sys_invites", function(err, result) {
				if (result) {
					result = JSON.parse(result);
					var temp = false;
					for (var i = 0; i<result.length; i++) {
						if (result[i].item == invite) {
							var adminStatus = result[i].adminStatus;
							temp = true;
							client.get("sys_users", function(err, users) {
								if (users) {
									users = JSON.parse(users);
									users.users[users.users.length] = { "login": username, "password": passwordHash.generate(password), "adminStatus": adminStatus };
									users = JSON.stringify(users);
									client.set("sys_users", users);
									res.redirect(307, '/?username='+username+'&password='+password);
									delete result[i];
									result = JSON.stringify(result);
									client.set("sys_invites", result);
								} else {
									res.redirect('registration/?err=0');
									console.log("Redis error: " + err);
								}
							});
						}
					}
					if (!temp) {
						res.redirect('registration/?err=0');
					}
				} else {
					console.log("Redis error: " + err);
				}
			});
		} else {
			res.redirect('registration/?err=2');
		}
	} else {
		res.redirect('registration/?err=1');
	}
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
		client.get("sys_users", function(err, result) {
			if (result) {
				result = JSON.parse(result);
				var temp = false;
				for (var i = 0; i<result.users.length; i++) {
					if (result.users[i].login == username && passwordHash.verify(password, result.users[i].password)) {
						var adminStatus = result.users[i].adminStatus;
						temp = true;
						var newId = randomstring.generate(23);
						var page = fs.readFileSync('public/homepage.html');
						res.cookie("moydvgups_admin_id", newId);
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(page);
						client.get("sys_active_id", function(err, result) {
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
								result.active_id[result.active_id.length] = { "id": newId, "date": Date.now(), "username": username, "adminStatus": adminStatus };
								result = JSON.stringify(result);
								client.set("sys_active_id", result);
							} else {
								console.log("Redis error: " + err);
							}
						});
						break;
					}
				}
				if (!temp) {
					res.redirect('/?enteringerror=0');
				}
			} else {
				console.log("Redis error: " + err);
			}
		});
	} else {
		res.redirect('/?enteringerror=1');
	}
});

function checkUser (request, callback) {
	var rc = request.cookies['moydvgups_admin_id'];
	client.get("sys_active_id", function(err, result) {
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
			client.set("sys_active_id", result);
		} else {
			console.log("Redis error: " + err);
		}
	});
}