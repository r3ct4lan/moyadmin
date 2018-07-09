var ftpClient = require('ftp');
const fs = require('fs');
const ftp_config = require('../../config/ftp.js');

module.exports = function (server, db) {
	const io = require('socket.io')(server);
	io.on('connection', socket => {
		socket.on('getUserInfo', userId => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_active_id", (err, result) => {
						if (result) {
							result = JSON.parse(result);
							for (var i = 0; i < result.active_id.length; i++) {
								if (result.active_id[i].id == userId) {
									var answer = {
										"username": result.active_id[i].username,
										"adminStatus": result.active_id[i].adminStatus
									};
									break;
								}
							}
							if (answer) {
								socket.emit('setUserInfo', answer, userId);
							}
						} else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});

		socket.on('changeUserName', (newUName, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_active_id", (err, result) => {
						if (result) {
							result = JSON.parse(result);
							var flag = false;
							for (var i = 0; i < result.active_id.length; i++) {
								if (result.active_id[i].id == userId) {
									var oldUName = result.active_id[i].username;
									db.get("sys_users", (err, result2) => {
										if (result2) {
											result2 = JSON.parse(result2);
											for (var j = 0; j < result2.users.length; j++) {
												if (result2.users[j].login == oldUName) {
													flag = true;
													result2.users[j].login = newUName;
													result2 = JSON.stringify(result2);
													db.set("sys_users", result2);
													result.active_id[i].username = newUName;
													result = JSON.stringify(result);
													db.set("sys_active_id", result);
													socket.emit("profileSuccess", userId);
													break;
												}
											}
											if (!flag) socket.emit("profileError", userId);
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
		});

		socket.on("userExit", userId => {
			db.get("sys_active_id", (err, result) => {
				if (result) {
					result = JSON.parse(result);
					var i = 0;
					do {
						if (result.active_id[i].id == userId) {
							result.active_id.splice(i, 1);
							i--;
						}
						i++;
					} while (i < result.active_id.length);
					result = JSON.stringify(result);
					db.set("sys_active_id", result);
				} else {
					console.log("Redis error: " + err);
				}
			});
		});
		socket.on("getAll", userId => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_menu_structure", (err, struct) => {
						db.get("sys_colors", (err, color) => {
							if (struct && color) {
								struct = JSON.parse(struct);
								color = JSON.parse(color);
								socket.emit("setAll", struct, color, userId);
							}
							else {
								console.log("Redis error: " + err);
							}
						});
					});
				}
			});
		});
		socket.on("updateMenuStructure", function (json, userId) {
			checkUserId(userId, temp => {
				if (temp) {
					json = JSON.stringify(json);
					db.set("sys_menu_structure", json);
				}
			});
		});
		socket.on("addNewColor", (json, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					json = JSON.stringify(json);
					db.set("sys_colors", json);
				}
			});
		});
		socket.on("getUnpublic", userId => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_unpublic", (err, struct) => {	
						if (struct) {
							struct = JSON.parse(struct);
							socket.emit("setUnpublic", struct, userId);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});
		socket.on("addUnpublicContent", (unpublicContent, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_unpublic", (err, json) => {
						if (json) {
							json = JSON.parse(json);
							for (var i = 0; i < unpublicContent.length; i++) {
								json.push(unpublicContent[i]);
							}
							json = JSON.stringify(json);
							db.set("sys_unpublic", json);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});
		socket.on("updateUnpublicContent", (unpublic, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					unpublic = JSON.stringify(unpublic);
					db.set("sys_unpublic", unpublic);
				}
			});
		});

		socket.on("getLastEvents", userId => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_events", (err, struct) => {	
						if (struct) {
							struct = JSON.parse(struct);
							socket.emit("setLastEvents", struct, userId);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});
		socket.on("updateEvents", (newEvent, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_events", (err, struct) => {	
						if (struct) {
							struct = JSON.parse(struct);
							if (struct.events.length > 14) {
								var temp = struct.events.length - 14;
								struct.events.splice(0, temp);
							}
							struct.events.push(newEvent);
							struct = JSON.stringify(struct);
							db.set("sys_events", struct);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});

		socket.on("getChat", userId => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_chat", (err, struct) => {	
						if (struct) {
							struct = JSON.parse(struct);
							socket.emit("setChat", struct);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});

		socket.on('newMessage', (newMessage, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get("sys_chat", (err, struct) => {	
						if (struct) {
							struct = JSON.parse(struct);
							if (struct.messages.length > 29) {
								var temp = struct.messages.length - 29;
								struct.messages.splice(0, temp);
							}
							struct.messages.push(newMessage);
							socket.emit("setChat", struct);
							struct = JSON.stringify(struct);
							db.set("sys_chat", struct);
						}
						else {
							console.log("Redis error: " + err);
						}
					});
				}
			});
		});
		/********************* File Manager ***************************/
		socket.on("getImagePreview", (path, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					var filePath = './moydvgups.ru/www/img/'+path;
					var ftp = new ftpClient();
					ftp.connect(ftp_config);
					ftp.on('ready', () => {
						ftp.get(filePath, function(err, stream) {
							if (err) throw err;
							stream.once('close', function() { ftp.end(); });
							var filetype = filePath.substr(filePath.lastIndexOf('.'));
							if (filetype != ".jpg" && filetype != ".jpeg" && filetype != ".png" && filetype != ".gif" && filetype != ".svg" && filetype != ".bmp") {
								socket.emit('errImgPreview', userId);
								ftp.end();
							} else {
								var saveStream = fs.createWriteStream("./public/img/tempPreviewImg"+filetype);
								saveStream.on('close', () => {
									socket.emit('setImgPreview', filetype, userId);
									ftp.end();
								});
								stream.pipe(saveStream);
							}
						});
					});
				}
			});
		});
		socket.on("getImgFiles", (path, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					var ftpPath = './moydvgups.ru/www/img/'+path;
					var ftp = new ftpClient();
					ftp.connect(ftp_config);
					ftp.on('ready', () => {
						ftp.list(ftpPath, function(err, list) {
							if (err) throw err;
							var files = [];
							for (var i = 0; i < list.length; i++) {
								files[i] = { "name": list[i].name, "type": list[i].type };
							}
							socket.emit('setImgFiles', files, userId);
							ftp.end();
						});
					});
				}
			});
		});
		/********************************************/
		socket.on("addNewArticle", (newArticle, structure, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					var filename = newArticle.alias;
					fs.writeFile("./ftpTemp/"+filename+".html", '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" type="text/css" href="css/lightbox.css"><link rel="stylesheet" href="css/pushy.css"><link href="css/style.css" rel="stylesheet"><title>'+newArticle.title+'</title><link rel="shortcut icon" href="img/favicon.ico"></head><body><div class="mainContainer"><header class="flatHeader" style="background-image: url(img/firtreeHeader2.jpg)"><button class="menu-btn">&#9776;</button><div class="container"><div class="row"><div class="col-md-12"><a href="index.html"><h1>#moydvgups</h1></a></div></div></div></header><div class="site-overlay"></div><section class="pageTopPict" style="background-image: url('+newArticle.backgr+');"><div class="pageTopPictMask trColor'+structure.sections[newArticle.sectionNum].colorNum+'"></div><div class="container"><div class="row"><div class="col-md-offset-1 col-md-10"><div class="textPic"><div class="iconblockFlat color'+structure.sections[newArticle.sectionNum].colorNum+'"><img src="'+newArticle.icon+'"></div><p>'+newArticle.title+'</p></div></div></div></div></section><section class="flatFont"><div class="container"></div></section><div class="hFooter"></div></div><footer><div class="container"><div class="row"><div class="col-lg-2 col-lg-offset-0 col-md-2 col-md-offset-1 col-sm-2 col-xs-12"><a href="http://www.dvgups.ru/" target="_blank" id="footer_logo"><img id="festu_logo" src="img/fot.png"></a></div><div class="col-lg-4 col-md-4 col-sm-4 col-xs-12"><p id="dvgups_footer">ФГБОУ ВО «Дальневосточный государственный университет путей сообщения»</p></div><div class="col-lg-1 col-lg-offset-3 col-md-1 col-md-offset-1 col-sm-1 col-sm-offset-2 col-xs-2 col-xs-offset-3"><a href="https://vk.com/studsovetdvgups"><img class="soc" src="img/vk_logo.png" alt="Студенческий Совет ДВГУПС Вконтакте" title="Студенческий Совет ДВГУПС Вконтакте"></a></div><div class="col-lg-1 col-md-1 col-sm-1 col-xs-2"><a href="https://www.instagram.com/moydvgups/"><img class="soc" src="img/instagram.png" alt="Moydvgups в Instagram" title="Moydvgups в Instagram"></a></div><div class="col-lg-1 col-md-1 col-sm-1 col-xs-2"><a href="files/magazine.pdf"><img class="soc" src="img/magazines.png" alt="Электронная версия журнала" title="Электронная версия журнала"></a></div></div></div></footer><script src="js/jquery-1.11.3.min.js"></script><script src="js/bootstrap.min.js"></script><script type="text/javascript" src="js/lightbox.min.js"></script><script>lightbox.option({"resizeDuration": 200, "wrapAround": true, showImageNumberLabel: false});</script><script src="js/pushy.min.js"></script><script src="js/upButton.js"></script><script src="js/moreButton.js"></script><script src="js/videoPauseFix.js"></script></body></html>', function(err) {
						if(err) return console.log(err);
						var ftp = new ftpClient();
						ftp.connect(ftp_config);
						ftp.on('ready', () => {
							ftp.put('./ftpTemp/'+filename+'.html', './moydvgups.ru/www/'+filename+'.html', err => {
								if (err) console.log(err);
								else {
									fs.unlinkSync('./ftpTemp/'+filename+'.html');
									newArticle = JSON.stringify(newArticle);
									db.set(filename, newArticle);
									socket.emit('newArticleIsReady', filename, userId);
								}
								ftp.end();
							});
						});
					});
				}
			});
		});

		socket.on("updateArticleTitle", (oldArtAlias, currArticle, structure, userId) => {
			checkUserId(userId, temp => {
				if (temp) {
					db.get(oldArtAlias, (err, struct) => {
						if (struct) {
							struct = JSON.parse(struct);
							currArticle.content = struct.content;
							db.del(oldArtAlias);
							var ftp = new ftpClient();
							ftp.connect(ftp_config);
							ftp.on('ready', () => {
								ftp.delete('./moydvgups.ru/www/'+oldArtAlias+'.html', err => {
									if (err) console.log(err);
									ftp.end();
								});
							});
							var ftp2 = new ftpClient();
							ftp2.connect(ftp_config);
							ftp2.on('ready', () => {
								var filename = currArticle.alias;
								fs.writeFile("./ftpTemp/"+filename+".html", '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" type="text/css" href="css/lightbox.css"><link rel="stylesheet" href="css/pushy.css"><link href="css/style.css" rel="stylesheet"><title>'+currArticle.title+'</title><link rel="shortcut icon" href="img/favicon.ico"></head><body><div class="mainContainer"><header class="flatHeader" style="background-image: url(img/firtreeHeader2.jpg)"><button class="menu-btn">&#9776;</button><div class="container"><div class="row"><div class="col-md-12"><a href="index.html"><h1>#moydvgups</h1></a></div></div></div></header><div class="site-overlay"></div><section class="pageTopPict" style="background-image: url('+currArticle.backgr+');"><div class="pageTopPictMask trColor'+structure.sections[currArticle.sectionNum].colorNum+'"></div><div class="container"><div class="row"><div class="col-md-offset-1 col-md-10"><div class="textPic"><div class="iconblockFlat color'+structure.sections[currArticle.sectionNum].colorNum+'"><img src="'+currArticle.icon+'"></div><p>'+currArticle.title+'</p></div></div></div></div></section><section class="flatFont"><div class="container"></div></section><div class="hFooter"></div></div><footer><div class="container"><div class="row"><div class="col-lg-2 col-lg-offset-0 col-md-2 col-md-offset-1 col-sm-2 col-xs-12"><a href="http://www.dvgups.ru/" target="_blank" id="footer_logo"><img id="festu_logo" src="img/fot.png"></a></div><div class="col-lg-4 col-md-4 col-sm-4 col-xs-12"><p id="dvgups_footer">ФГБОУ ВО «Дальневосточный государственный университет путей сообщения»</p></div><div class="col-lg-1 col-lg-offset-3 col-md-1 col-md-offset-1 col-sm-1 col-sm-offset-2 col-xs-2 col-xs-offset-3"><a href="https://vk.com/studsovetdvgups"><img class="soc" src="img/vk_logo.png" alt="Студенческий Совет ДВГУПС Вконтакте" title="Студенческий Совет ДВГУПС Вконтакте"></a></div><div class="col-lg-1 col-md-1 col-sm-1 col-xs-2"><a href="https://www.instagram.com/moydvgups/"><img class="soc" src="img/instagram.png" alt="Moydvgups в Instagram" title="Moydvgups в Instagram"></a></div><div class="col-lg-1 col-md-1 col-sm-1 col-xs-2"><a href="files/magazine.pdf"><img class="soc" src="img/magazines.png" alt="Электронная версия журнала" title="Электронная версия журнала"></a></div></div></div></footer><script src="js/jquery-1.11.3.min.js"></script><script src="js/bootstrap.min.js"></script><script type="text/javascript" src="js/lightbox.min.js"></script><script>lightbox.option({"resizeDuration": 200, "wrapAround": true, showImageNumberLabel: false});</script><script src="js/pushy.min.js"></script><script src="js/upButton.js"></script><script src="js/moreButton.js"></script><script src="js/videoPauseFix.js"></script></body></html>', function(err) {
									if(err) return console.log(err);
									ftp2.put('./ftpTemp/'+filename+'.html', './moydvgups.ru/www/'+filename+'.html', err => {
										if (err) console.log(err);
										else {
											fs.unlinkSync('./ftpTemp/'+filename+'.html');
											currArticle = JSON.stringify(currArticle);
											db.set(filename, currArticle);
											socket.emit('newArticleIsReady', filename, userId);
										}
										ftp2.end();
									});
								});
							});
						}
						else {
							console.log("Redis error: " + err);
						}
					});
}
});
});

socket.on('updateArticleContent', (page, userId) => {
	checkUserId(userId, temp => {
		if (temp) {
			db.get(page.alias, (err, struct) => {
				if (struct) {
					struct = JSON.parse(struct);
					struct.content = page.content;
					struct = JSON.stringify(struct);
					db.set(page.alias, struct);
				} else {
					console.log("Redis error: " + err);
				}
			});
		}
	});
});

socket.on("deleteArticle", (article, userId) => {
	checkUserId(userId, temp => {
		if (temp) {
			db.del(article);
			var ftp = new ftpClient();
			ftp.connect(ftp_config);
			ftp.on('ready', () => {
				ftp.delete('./moydvgups.ru/www/'+article+'.html', err => {
					if (err) console.log(err);
					ftp.end();
				});
			});
		}
	});
});

socket.on("getArticle", (article, userId) => {
	checkUserId(userId, temp => {
		if (temp) {
			db.get(article, (err, struct) => {
				if (struct) {
					db.get("sys_menu_structure", (err, menu) => {
						db.get("sys_colors", (err, color) => {
							if (menu && color) {
								menu = JSON.parse(menu);
								struct = JSON.parse(struct);
								color = JSON.parse(color);
								socket.emit("setArticle", struct, menu, color, userId);
							} else {
								console.log("Redis error: " + err);
							}
						});
					});
				} else {
					socket.emit("setArticle", null, null, null, userId);
				}
			});
		}
	});
});
});

function checkUserId(userId, callback) {
	var temp = false;
	db.get("sys_active_id", function(err, result) {
		if (result) {
			result = JSON.parse(result);
			for (var j = 0; j<result.active_id.length; j++) {
				if (result.active_id[j].id == userId) {
					temp = true;
					break;
				}
			}
			callback(temp);
		} else {
			console.log("Redis error: " + err);
		}
	});
}
};