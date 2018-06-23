Dropzone.autoDiscover = false;
$(document).ready(function() {
	const socket = io.connect('https://moyadmin.herokuapp.com');
	function get_cookie ( cookie_name ) {	//получение значения cookie
		var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
		if ( results ) return ( unescape ( results[2] ) );
		else return null;
	}
	const uName = get_cookie("username");
	const idCookie = get_cookie("moydvgups_admin_id");
	const pageType = window.location.search.substr(window.location.search.indexOf('?')+1, window.location.search.indexOf('&')-1);

	socket.emit("getAll", idCookie);
	socket.on("setAll", (structure, colors, userId) => {
		if (userId == idCookie) {
			if (pageType == "new") {
				var randSection = Math.floor(Math.random() * (structure.sections.length));
				var randArticle = Math.floor(Math.random() * (structure.sections[randSection].content.length));
				switch_to_articleType();
				
				function switch_to_articleType() {
					$('#edit_link_form').remove();
					$("#article_edit").append('<form id="edit_article_form"><h1>Создать новую статью<button type="button" id="switch_to_linkType" class="btn btn-link">Создать ссылку</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp" placeholder="Например: '+structure.sections[randSection].content[randArticle].linkName+'"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком статья будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Псевдоним</label><input type="text" class="form-control" id="article-alias" aria-describedby="aliasHelp" placeholder="Например: '+structure.sections[randSection].content[randArticle].linkAddress.substr(0, structure.sections[randSection].content[randArticle].linkAddress.lastIndexOf('.'))+'"><small id="aliasHelp" class="form-text text-muted">Псевдоним статьи должен состоять из букв английского алфавита и цифр без пробелов и знаков препинания.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Статья будет размещена в выбранном разделе.</small></div><div class="form-group" id="article_icon"><btn class="btn btn-info" data-toggle="modal" data-target="#article-icon">Иконка</btn></div><div class="form-group" id="article_backgr"><btn class="btn btn-info" data-toggle="modal" data-target="#article-backgr">Фоновое изображение</btn></div><div class="modal-footer"><button type="button" class="btn btn-primary">Сохранить</button></div></form>');
					for (var i = 0; i < structure.sections.length; i++) {
						$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
					}
					$('#switch_to_linkType').on('click', () => {
						switch_to_linkType();
					});

					$("#article-title").on('paste keyup click', () => {
						if ($("#article-title").val() == '') {
							$("#article-title").attr('class', 'form-control is-invalid');
						} else {
							$("#article-title").attr('class', 'form-control is-valid');
						}
					});

					$("#article-alias").on('paste keyup click', () => {
						if ($("#article-alias").val().match(/[^A-Za-z0-9]/g) || $("#article-alias").val() == '') {
							$("#article-alias").attr('class', 'form-control is-invalid');
						} else {
							$("#article-alias").attr('class', 'form-control is-valid');
						}
					});

					$('#edit_article_form .btn-primary').click(() => {
						var validCheck = true;
						for (var i = 0; i < structure.sections.length; i++) {
							for (var j = 0; j < structure.sections[i].content.length; j++) {
								if ($("#article-title").val() == structure.sections[i].content[j].linkName) {
									alert('Статья или ссылка с таким именем уже существует.');
									$("#article-title").attr('class', 'form-control is-invalid');
									validCheck = false;
									break;
								}
								if ($("#article-alias").val() == structure.sections[i].content[j].linkAddress.substr(0, structure.sections[i].content[j].linkAddress.lastIndexOf('.')) && validCheck) {
									alert('Статья с таким псевдонимом уже существует.');
									$("#article-alias").attr('class', 'form-control is-invalid');
									validCheck = false;
									break;
								}
							}
						}
						if (!validCheck || !$('div').is('.preview-image-icon') || !$('div').is('.preview-image-backgr')) {
							alert("Заполните все поля!");
						} else {
							structure.sections[$('#article-section').val()].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-alias').val() + '.html', linkType: "article" });
							var newArticle = { 
								"alias": $('#article-alias').val(),
								"title": $('#article-title').val(),
								"sectionNum": $('#article-section').val(),
								"icon": $('.preview-image-icon > img').attr('data-path'),
								"backgr": $('.preview-image-backgr > img').attr('data-path'),
								"content": [{
									"name": "",
									"elements": []
								}]								
							}
							var newEvent = {
								"date": Date.now(),
								"text": "<b>"+uName+"</b> создал статью <b>"+newArticle.title+"</b>"
							}
							socket.emit("updateEvents", newEvent, idCookie);
							socket.emit("updateMenuStructure", structure, idCookie);
							socket.emit("addNewArticle", newArticle, structure, idCookie);
							socket.on('newArticleIsReady', (filename, userId) => {
								if (userId == idCookie) {
									window.location.replace("/edit?page&pageAlias="+filename);
								}
							});
						}
					});
				}

				function switch_to_linkType() {
					$('#edit_article_form').remove();
					$("#article_edit").append('<form id="edit_link_form"><h1>Создать новую ссылку<button type="button" id="switch_to_articleType" class="btn btn-link">Создать статью</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp" placeholder="Например: '+structure.sections[randSection].content[randArticle].linkName+'"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком ссылка будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Адрес</label><input type="text" class="form-control" id="article-link" aria-describedby="aliasHelp" placeholder="Например: http://dvgups.ru/studtopmenu/study"><small id="aliasHelp" class="form-text text-muted">Адрес ссылки.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Ссылка будет размещена в выбранном разделе.</small></div><div class="modal-footer"><button type="button" class="btn btn-primary">Сохранить</button></div></form>');
					for (var i = 0; i < structure.sections.length; i++) {
						$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
					}
					$('#switch_to_articleType').on('click', () => {
						switch_to_articleType();
					});

					$("#article-title").on('paste keyup click', () => {
						if ($("#article-title").val() == '') {
							$("#article-title").attr('class', 'form-control is-invalid');
						} else {
							$("#article-title").attr('class', 'form-control is-valid');
						}
					});

					$("#article-link").on('paste keyup click', () => {
						if ($("#article-link").val().match(/[А-Яа-я]/g) || $("#article-alias").val() == '') {
							$("#article-link").attr('class', 'form-control is-invalid');
						} else {
							$("#article-link").attr('class', 'form-control is-valid');
						}
					});

					$('#edit_link_form .btn-primary').click(() => {
						var validCheck = true;
						for (var i = 0; i < structure.sections.length; i++) {
							for (var j = 0; j < structure.sections[i].content.length; j++) {
								if ($("#article-title").val() == structure.sections[i].content[j].linkName) {
									alert('Статья или ссылка с таким именем уже существует.');
									$("#article-alias").attr('class', 'form-control is-invalid');
									validCheck = false;
									break;
								}
								if ($("#article-link").val() == structure.sections[i].content[j].linkAddress.substr(0, structure.sections[i].content[j].linkAddress.lastIndexOf('.')) && validCheck) {
									alert('Ссылка с таким адресом уже существует.');
									$("#article-link").attr('class', 'form-control is-invalid');
									validCheck = false;
									break;
								}
							}
						}
						if (validCheck) {
							var sectionNum = $('#article-section').val();
							var newEvent = {
								"date": Date.now(),
								"text": "<b>"+uName+"</b> создал ссылку <b>"+$('#article-title').val()+"</b>"
							}
							socket.emit("updateEvents", newEvent, idCookie);
							structure.sections[sectionNum].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-link').val(), linkType: "link" });
							socket.emit("updateMenuStructure", structure, idCookie);
							$('#edit_link_form').remove();
							$('#article_edit').append('<br><div class="alert alert-success">Ссылка успешно добавлена в раздел "'+structure.sections[sectionNum].title+'"</div>');
						}
					});
				}
			} else if (pageType == "titles") {
				var parametrs = parseParametrs(window.location.search.match(/\&(.*)/)[1]);
				var artNum;
				for (var i = 0; i < structure.sections[parametrs.secNum].content.length; i++) {
					if ( structure.sections[parametrs.secNum].content[i].linkAddress == parametrs.artAddr ) {
						artNum = i;
					}
				}
				socket.emit("getArticle", structure.sections[parametrs.secNum].content[artNum].linkAddress.replace('.html',''), idCookie);
				socket.on("setArticle", (article_json, dontUse, dotnUse, userId) => {
					if (userId == idCookie) {
						if (parametrs.type == "article") {
							switch_to_articleType();
						} else if (parametrs.type == "link") {
							switch_to_linkType();
						} else {
							window.location.replace("/404");
						}
					}
					function switch_to_articleType() {
						var oldArtAlias = structure.sections[parametrs.secNum].content[artNum].linkAddress.substr(0, structure.sections[parametrs.secNum].content[artNum].linkAddress.lastIndexOf('.'));
						$('#edit_link_form').remove();
						$("#article_edit").append('<form id="edit_article_form"><h1>Изменить статью<button type="button" id="switch_to_linkType" class="btn btn-link">Изменить на ссылку</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком статья будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Псевдоним</label><input type="text" class="form-control" id="article-alias" aria-describedby="aliasHelp"><small id="aliasHelp" class="form-text text-muted">Псевдоним статьи должен состоять из букв английского алфавита и цифр без пробелов и знаков препинания.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Статья будет размещена в выбранном разделе.</small></div><div class="form-group" id="article_icon"><btn class="btn btn-info" data-toggle="modal" data-target="#article-icon">Изменить иконку</btn></div><div class="form-group" id="article_backgr"><btn class="btn btn-info" data-toggle="modal" data-target="#article-backgr">Изменить фоновое изображение</btn></div><div class="modal-footer"><button type="button" class="btn btn-secondary">Отмена</button><button type="button" class="btn btn-primary">Сохранить</button></div></form>');
						for (var i = 0; i < structure.sections.length; i++) {
							if (i == parametrs.secNum) {
								$('select#article-section').append('<option selected value='+i+'>'+structure.sections[i].title+'</option>');
							} else {
								$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
							}
						}

						$('#article-title').val(structure.sections[parametrs.secNum].content[artNum].linkName);
						if (article_json) {
							$("#article-alias").val(article_json.alias);
							$("#article_icon").append('<div class="preview-image-icon"><img src="http://moydvgups.ru'+article_json.icon+'" data-path="'+article_json.icon+'"></div>');
							$("#article_backgr").append('<div class="preview-image-backgr"><img src="http://moydvgups.ru'+article_json.backgr+'" data-path="'+article_json.backgr+'"></div>');
						}

						$('#switch_to_linkType').on('click', () => {
							switch_to_linkType();
						});

						$("#article-title").on('paste keyup click', () => {
							if ($("#article-title").val() == '') {
								$("#article-title").attr('class', 'form-control is-invalid');
							} else {
								$("#article-title").attr('class', 'form-control is-valid');
							}
						});

						$("#article-alias").on('paste keyup click', () => {
							if ($("#article-alias").val().match(/[^A-Za-z0-9]/g) || $("#article-alias").val() == '') {
								$("#article-alias").attr('class', 'form-control is-invalid');
							} else {
								$("#article-alias").attr('class', 'form-control is-valid');
							}
						});

						$('#edit_article_form .btn-primary').click(() => {
							var validCheck = true;
							for (var i = 0; i < structure.sections.length; i++) {
								for (var j = 0; j < structure.sections[i].content.length; j++) {
									if ($("#article-title").val() == structure.sections[i].content[j].linkName && $("#article-title").val() != structure.sections[parametrs.secNum].content[artNum].linkName) {
										alert('Статья или ссылка с таким именем уже существует.');
										$("#article-title").attr('class', 'form-control is-invalid');
										validCheck = false;
										break;
									}
									if ($("#article-alias").val() == structure.sections[i].content[j].linkAddress.substr(0, structure.sections[i].content[j].linkAddress.lastIndexOf('.')) && $("#article-alias").val() != oldArtAlias && validCheck) {
										alert('Статья с таким псевдонимом уже существует.');
										$("#article-alias").attr('class', 'form-control is-invalid');
										validCheck = false;
										break;
									}
								}
							}
							if (!validCheck || !$('div').is('.preview-image-icon') || !$('div').is('.preview-image-backgr')) {
								alert("Заполните все поля!");
							} else {
								if(parametrs.secNum == $('#article-section').val()) {
									structure.sections[parametrs.secNum].content[artNum].linkName = $('#article-title').val();
									structure.sections[parametrs.secNum].content[artNum].linkAddress = $('#article-alias').val() + '.html';
									structure.sections[parametrs.secNum].content[artNum].linkType = "article";
								} else {
									structure.sections[parametrs.secNum].content.splice(artNum, 1);
									structure.sections[$('#article-section').val()].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-alias').val() + '.html', linkType: "article" });
								}
								var currArticle = { 
									"alias": $('#article-alias').val(),
									"title": $('#article-title').val(),
									"sectionNum": $('#article-section').val(),
									"icon": $('.preview-image-icon > img').attr('data-path'),
									"backgr": $('.preview-image-backgr > img').attr('data-path'),
									"content": null							
								}
								var newEvent = {
									"date": Date.now(),
									"text": "<b>"+uName+"</b> изменил статью <b>"+$('#article-title').val()+"</b>"
								}
								socket.emit("updateEvents", newEvent, idCookie);
								socket.emit("updateMenuStructure", structure, idCookie);
								socket.emit("updateArticleTitle", oldArtAlias ,currArticle, structure, idCookie);
								socket.on('newArticleIsReady', (filename, userId) => {
									if (userId == idCookie) {
										window.location.replace("/edit?page&pageAlias="+currArticle.alias);
									}
								});
							}
						});

						$('#edit_article_form .btn-secondary').click(() => {
							window.location.replace("/section?"+parametrs.secNum);
						});
					}

					function switch_to_linkType() {
						$('#edit_article_form').remove();
						$("#article_edit").append('<form id="edit_link_form"><h1>Изменить ссылку<button type="button" id="switch_to_articleType" class="btn btn-link">Изменить на статью</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком ссылка будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Адрес</label><input type="text" class="form-control" id="article-link" aria-describedby="aliasHelp"><small id="aliasHelp" class="form-text text-muted">Адрес ссылки.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Ссылка будет размещена в выбранном разделе.</small></div><div class="modal-footer"><button type="button" class="btn btn-secondary">Отмена</button><button type="button" class="btn btn-primary">Сохранить</button></div></form>');
						for (var i = 0; i < structure.sections.length; i++) {
							if (i == parametrs.secNum) {
								$('select#article-section').append('<option selected value='+i+'>'+structure.sections[i].title+'</option>');
							} else {
								$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
							}
						}

						$('#article-title').val(structure.sections[parametrs.secNum].content[artNum].linkName);
						$("#article-link").val(structure.sections[parametrs.secNum].content[artNum].linkAddress);

						$('#switch_to_articleType').on('click', () => {
							switch_to_articleType();
						});

						$("#article-title").on('paste keyup click', () => {
							if ($("#article-title").val() == '') {
								$("#article-title").attr('class', 'form-control is-invalid');
							} else {
								$("#article-title").attr('class', 'form-control is-valid');
							}
						});

						$("#article-link").on('paste keyup click', () => {
							if ($("#article-link").val().match(/[А-Яа-я]/g) || $("#article-alias").val() == '') {
								$("#article-link").attr('class', 'form-control is-invalid');
							} else {
								$("#article-link").attr('class', 'form-control is-valid');
							}
						});

						$('#edit_link_form .btn-primary').click(() => {
							var validCheck = true;
							for (var i = 0; i < structure.sections.length; i++) {
								for (var j = 0; j < structure.sections[i].content.length; j++) {
									if ($("#article-title").val() == structure.sections[i].content[j].linkName && $("#article-title").val() != structure.sections[parametrs.secNum].content[artNum].linkName) {
										alert('Статья или ссылка с таким именем уже существует.');
										$("#article-alias").attr('class', 'form-control is-invalid');
										validCheck = false;
										break;
									}
									if ($("#article-link").val() == structure.sections[i].content[j].linkAddress && $("#article-link").val() != structure.sections[parametrs.secNum].content[artNum].linkAddress && validCheck) {
										alert('Ссылка с таким адресом уже существует.');
										$("#article-link").attr('class', 'form-control is-invalid');
										validCheck = false;
										break;
									}
								}
							}
							if (validCheck) {
								var sectionNum = $('#article-section').val();
								if (parametrs.secNum == sectionNum) {
									structure.sections[parametrs.secNum].content[artNum].linkName = $('#article-title').val();
									structure.sections[parametrs.secNum].content[artNum].linkAddress = $('#article-link').val();
									structure.sections[parametrs.secNum].content[artNum].linkType = "link";
								} else {
									structure.sections[parametrs.secNum].content.splice(artNum, 1);
									structure.sections[sectionNum].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-link').val(), linkType: "link" });
								}
								var newEvent = {
									"date": Date.now(),
									"text": "<b>"+uName+"</b> изменил ссылку <b>"+$('#article-title').val()+"</b>"
								}
								socket.emit("updateEvents", newEvent, idCookie);
								socket.emit("updateMenuStructure", structure, idCookie);
								window.location.replace("/section?"+parametrs.secNum);
							}
						});

						$('#edit_link_form .btn-secondary').click(() => {
							window.location.replace("/section?"+parametrs.secNum);
						});
					}
				});
} else if (pageType == "unpublic") {
	socket.emit("getUnpublic", idCookie);
	socket.on("setUnpublic", (unpublic, userId) => {
		var parametrs = parseParametrs(window.location.search.match(/\&(.*)/)[1]);
		socket.emit("getArticle", unpublic[parametrs.num].linkAddress.replace('.html',''), idCookie);
		socket.on("setArticle", (article_json, dontUse, dotnUse, userId) => {
			if (userId == idCookie) {
				if (parametrs.type == "article") {
					switch_to_articleType();
				} else if (parametrs.type == "link") {
					switch_to_linkType();
				} else {
					window.location.replace("/404");
				}
			}
			function switch_to_articleType() {
				var oldArtAlias = unpublic[parametrs.num].linkAddress.substr(0, unpublic[parametrs.num].linkAddress.lastIndexOf('.'));
				$('#edit_link_form').remove();
				$("#article_edit").append('<form id="edit_article_form"><h1>Изменить статью<button type="button" id="switch_to_linkType" class="btn btn-link">Изменить на ссылку</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком статья будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Псевдоним</label><input type="text" class="form-control" id="article-alias" aria-describedby="aliasHelp"><small id="aliasHelp" class="form-text text-muted">Псевдоним статьи должен состоять из букв английского алфавита и цифр без пробелов и знаков препинания.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Статья будет размещена в выбранном разделе.</small></div><div class="form-group" id="article_icon"><btn class="btn btn-info" data-toggle="modal" data-target="#article-icon">Изменить иконку</btn></div><div class="form-group" id="article_backgr"><btn class="btn btn-info" data-toggle="modal" data-target="#article-backgr">Изменить фоновое изображение</btn></div><div class="modal-footer"><button type="button" class="btn btn-secondary">Отмена</button><button type="button" class="btn btn-primary">Опубликовать</button></div></form>');
				for (var i = 0; i < structure.sections.length; i++) {
					$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
				}

				$('#article-title').val(unpublic[parametrs.num].linkName);
				if (article_json) {
					$("#article-alias").val(article_json.alias);
					$("#article_icon").append('<div class="preview-image-icon"><img src="http://moydvgups.ru'+article_json.icon+'" data-path="'+article_json.icon+'"></div>');
					$("#article_backgr").append('<div class="preview-image-backgr"><img src="http://moydvgups.ru'+article_json.backgr+'" data-path="'+article_json.backgr+'"></div>');
				}

				$('#switch_to_linkType').on('click', () => {
					switch_to_linkType();
				});

				$("#article-title").on('paste keyup click', () => {
					if ($("#article-title").val() == '') {
						$("#article-title").attr('class', 'form-control is-invalid');
					} else {
						$("#article-title").attr('class', 'form-control is-valid');
					}
				});

				$("#article-alias").on('paste keyup click', () => {
					if ($("#article-alias").val().match(/[^A-Za-z0-9]/g) || $("#article-alias").val() == '') {
						$("#article-alias").attr('class', 'form-control is-invalid');
					} else {
						$("#article-alias").attr('class', 'form-control is-valid');
					}
				});

				$('#edit_article_form .btn-primary').click(() => {
					var validCheck = true;
					for (var i = 0; i < structure.sections.length; i++) {
						for (var j = 0; j < structure.sections[i].content.length; j++) {
							if ($("#article-title").val() == structure.sections[i].content[j].linkName && $("#article-title").val() != structure.sections[parametrs.secNum].content[parametrs.artNum].linkName) {
								alert('Статья или ссылка с таким именем уже существует.');
								$("#article-title").attr('class', 'form-control is-invalid');
								validCheck = false;
								break;
							}
							if ($("#article-alias").val() == structure.sections[i].content[j].linkAddress.substr(0, structure.sections[i].content[j].linkAddress.lastIndexOf('.')) && $("#article-alias").val() != oldArtAlias && validCheck) {
								alert('Статья с таким псевдонимом уже существует.');
								$("#article-alias").attr('class', 'form-control is-invalid');
								validCheck = false;
								break;
							}
						}
					}
					if (!validCheck || !$('div').is('.preview-image-icon') || !$('div').is('.preview-image-backgr')) {
						alert("Заполните все поля!");
					} else {
						unpublic.splice(parametrs.num, 1);
						structure.sections[$('#article-section').val()].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-alias').val() + '.html', linkType: "article" });
						var currArticle = { 
							"alias": $('#article-alias').val(),
							"title": $('#article-title').val(),
							"sectionNum": $('#article-section').val(),
							"icon": $('.preview-image-icon > img').attr('data-path'),
							"backgr": $('.preview-image-backgr > img').attr('data-path'),
							"content": null							
						}
						var newEvent = {
							"date": Date.now(),
							"text": "<b>"+uName+"</b> опубликовал статью <b>"+$('#article-title').val()+"</b>"
						}
						socket.emit("updateEvents", newEvent, idCookie);
						socket.emit("updateUnpublicContent", unpublic, idCookie);
						socket.emit("updateMenuStructure", structure, idCookie);
						socket.emit("updateArticleTitle", oldArtAlias ,currArticle, structure, idCookie);
						socket.on('newArticleIsReady', (filename, userId) => {
							if (userId == idCookie) {
								window.location.replace("/homepage");
							}
						});
					}
				});

				$('#edit_article_form .btn-secondary').click(() => {
					window.location.replace("/homepage");
				});
			}

			function switch_to_linkType() {
				$('#edit_article_form').remove();
				$("#article_edit").append('<form id="edit_link_form"><h1>Изменить ссылку<button type="button" id="switch_to_articleType" class="btn btn-link">Изменить на статью</button></h1><div class="form-group"><label for="article-title">Заголовок</label><input type="text" class="form-control" id="article-title" aria-describedby="titleHelp"><small id="titleHelp" class="form-text text-muted">Под выбранным заголовком ссылка будет размещена в одной из "плиток" на главной странице.</small></div><div class="form-group"><label for="article-alias">Адрес</label><input type="text" class="form-control" id="article-link" aria-describedby="aliasHelp"><small id="aliasHelp" class="form-text text-muted">Адрес ссылки.</small></div><div class="form-group"><label for="article-section">Раздел</label><select class="form-control" id="article-section" aria-describedby="sectionHelp"></select><small id="sectionHelp" class="form-text text-muted">Ссылка будет размещена в выбранном разделе.</small></div><div class="modal-footer"><button type="button" class="btn btn-secondary">Отмена</button><button type="button" class="btn btn-primary">Опубликовать</button></div></form>');
				for (var i = 0; i < structure.sections.length; i++) {
					$('select#article-section').append('<option value='+i+'>'+structure.sections[i].title+'</option>');
				}

				$('#article-title').val(unpublic[parametrs.num].linkName);
				$("#article-link").val(unpublic[parametrs.num].linkAddress);

				$('#switch_to_articleType').on('click', () => {
					switch_to_articleType();
				});

				$("#article-title").on('paste keyup click', () => {
					if ($("#article-title").val() == '') {
						$("#article-title").attr('class', 'form-control is-invalid');
					} else {
						$("#article-title").attr('class', 'form-control is-valid');
					}
				});

				$("#article-link").on('paste keyup click', () => {
					if ($("#article-link").val().match(/[А-Яа-я]/g) || $("#article-alias").val() == '') {
						$("#article-link").attr('class', 'form-control is-invalid');
					} else {
						$("#article-link").attr('class', 'form-control is-valid');
					}
				});

				$('#edit_link_form .btn-primary').click(() => {
					var validCheck = true;
					for (var i = 0; i < structure.sections.length; i++) {
						for (var j = 0; j < structure.sections[i].content.length; j++) {
							if ($("#article-title").val() == structure.sections[i].content[j].linkName) {
								alert('Статья или ссылка с таким именем уже существует.');
								$("#article-alias").attr('class', 'form-control is-invalid');
								validCheck = false;
								break;
							}
							if ($("#article-link").val() == structure.sections[i].content[j].linkAddress && validCheck) {
								alert('Ссылка с таким адресом уже существует.');
								$("#article-link").attr('class', 'form-control is-invalid');
								validCheck = false;
								break;
							}
						}
					}
					if (validCheck) {
						var sectionNum = $('#article-section').val();
						unpublic.splice(parametrs.num, 1);
						structure.sections[sectionNum].content.push({linkName: $('#article-title').val(), linkAddress: $('#article-link').val(), linkType: "link" });
						socket.emit("updateUnpublicContent", unpublic, idCookie);
						socket.emit("updateMenuStructure", structure, idCookie);
						var newEvent = {
							"date": Date.now(),
							"text": "<b>"+uName+"</b> опубликовал ссылку <b>"+$('#article-title').val()+"</b>"
						}
						socket.emit("updateEvents", newEvent, idCookie);
						window.location.replace("/homepage");
					}
				});

				$('#edit_link_form .btn-secondary').click(() => {
					window.location.replace("/homepage");
				});
			}
		});
});
}
}
});

var iconUploader = new Dropzone('#change-icon-dropzone', {
	acceptedFiles: 'image/*',
	paramName: "file",
	maxFiles: 1
});

$('#article-icon').on('show.bs.modal', function () {
	iconUploader.on('complete', function( file, resp ){
		if (file.dataURL) {
			$('#article-icon #current_img').parent('div').remove();
			$('#article-icon form.dropzone').parent('div').attr('class', 'col-md-6');
			$('#article-icon .modal-body').prepend('<div class="col-md-6" style="border-right: 1px solid #e9ecef;"><h6>Новое изображение:</h6><div id="current_img"><img src="'+file.dataURL+'" data-path="/img/icons/'+file.name+'"></div></div>');
		} else {
			alert('Ошибка загрузки файла.');
		}
		iconUploader.removeFile(file);
	});

	$('#article-icon .btn-primary').click(function () {
		if ($('#article-icon div').is('#current_img')) {
			$('.preview-image-icon').remove();
			$('#article_icon').append('<div class="preview-image-icon"><img src="'+$('#article-icon #current_img > img').attr('src')+'" data-path="'+$('#article-icon #current_img > img').attr('data-path')+'"></div>');
		}
		$('#article-icon').modal('toggle');
	});

	$('#article-icon .btn-secondary').click(function () {
		$('form.dropzone').parent('div').attr('class', 'col-md-12');
		$('#article-icon #current_img').parent('div').remove();
	});

	$('#article-icon').on('hidden.bs.modal', function () {
		$('body').css({
			'overflow-y': 'auto'
		});
	});
});

var backgrUploader = new Dropzone('#change-backgr-dropzone', {
	acceptedFiles: 'image/*',
	paramName: "file",
	maxFiles: 1
});

$('#article-backgr').on('show.bs.modal', function () {
	backgrUploader.on('complete', function( file, resp ){
		if (file.dataURL) {
			$('#article-backgr #current_img').parent('div').remove();
			$('#article-backgr form.dropzone').parent('div').attr('class', 'col-md-6');
			$('#article-backgr .modal-body').prepend('<div class="col-md-6" style="border-right: 1px solid #e9ecef;"><h6>Новое изображение:</h6><div id="current_img"><img src="'+file.dataURL+'" data-path="/img/backgrounds/'+file.name+'"></div></div>');
		} else {
			alert('Ошибка загрузки файла.');
		}
		backgrUploader.removeFile(file);
	});

	$('#article-backgr .btn-primary').click(function () {
		if ($('#article-backgr div').is('#current_img')) {
			$('.preview-image-backgr').remove();
			$('#article_backgr').append('<div class="preview-image-backgr"><img src="'+$('#article-backgr #current_img > img').attr('src')+'" data-path="'+$('#article-backgr #current_img > img').attr('data-path')+'"></div>');
		}
		$('#article-backgr').modal('toggle');
	});

	$('#article-backgr .btn-secondary').click(function () {
		$('form.dropzone').parent('div').attr('class', 'col-md-12');
		$('#article-backgr #current_img').parent('div').remove();
	});

	$('#article-backgr').on('hidden.bs.modal', function () {
		$('body').css({
			'overflow-y': 'auto'
		});
	});
});

$('#sec_file_manager').on('show.bs.modal', function () {
	$('#file-manager').append('<img id="loader_gif" src="img/loader.gif"/>');
	var path = "";
	var filename = "";
	var filetype = "";
	socket.emit('getImgFiles', path, idCookie);
	setFileList();

	$('#sec_file_manager').on('hidden.bs.modal', function () {
		path = "";
		filename = "";
		filetype = "";
		$('.files_str').remove();
		$('#file-manager').attr('class', 'col-md-12');
		$('#file-manager').next().remove();
		$('.modal').css({
			'overflow-x': 'hidden',
			'overflow-y': 'auto'
		});
		$('body').css({
			'overflow-y': 'hidden'
		});
	});

	function setFileList() {
		socket.once("setImgFiles", (files, userId) => {
			if (userId == idCookie) {
				$('#loader_gif').remove();
				for (var i=0; i<files.length; i++) {
					if (files[i].type == "d" && files[i].name != '..') {
						$('#file-manager').append('<div class="files_str"><img src="img/folder.svg"/><a class="folder_link" href="#">'+files[i].name+'</a></div>');
					}
				}
				for (var i=0; i<files.length; i++) {
					if (files[i].type != "d") {
						$('#file-manager').append('<div class="files_str"><img src="img/file.svg"/><a class="file_link" href="#" title="'+files[i].name+'">'+files[i].name+'</a></div>');
					}
				}
				$('.folder_link').on('click', goToFolder);
				$('.file_link').on('click', filePreview);
			}
		});
	}

	function fileSelected(event) {
		$('.show #current_img').parent('div').remove();
		$('.show form.dropzone').parent('div').attr('class', 'col-md-6');
		$('.show .modal-body #open-file-manager').parent().parent().prepend('<div class="col-md-6" style="border-right: 1px solid #e9ecef;"><h6>Новое изображение:</h6><div id="current_img"><img src="img/tempPreviewImg'+filetype+'?'+Date.now().toString()+'" data-path="/img'+path+"/"+filename+'"></div></div>');
		$('#sec_file_manager').modal('toggle');
	}

	function goToFolder(event) {
		$('#loader_gif').remove();
		$('#file_preview').parent().remove();
		$('#file-manager').attr('class', 'col-md-12');
		$('#file-manager').append('<img id="loader_gif" src="img/loader.gif"/>');
		$('.files_str').remove();
		if ($(this).text() != '.') path += "/"+$(this).text();
		else path = path.substr(0, path.lastIndexOf('/'));
		socket.emit('getImgFiles', path, idCookie);
		setFileList();
	}

	function filePreview(event) {
		$('#loader_gif').remove();
		$('#file_preview_out').parent().remove();
		$('#file-manager').attr('class', 'col-md-6');
		$('#file-manager').parent().append('<div class="col-md-6"><div id="file_preview_out"><div id="file_preview_in"><img id="loader_gif" src="img/loader.gif"/></div></div></div>');
		var current_pos = $(this).position().top;
		$('#file_preview_out').css({
			'top': current_pos
		});
		if (path == ".") path = "";
		filename = $(this).text();
		socket.emit('getImagePreview', path+'/'+$(this).text(), idCookie);
		renderPreview();
	}

	function renderPreview() {
		socket.once('errImgPreview', userId => {
			if (userId == idCookie) {
				$('#loader_gif').remove();
				$('#file_preview_in').append('<p>Просмотр изображения недоступен.</p>');
			}
		});
		socket.once('setImgPreview', (ftype, userId) => {
			if (userId == idCookie) {
				$('#loader_gif').remove();
				filetype = ftype;
				$('#file_preview_in').append('<div class="modal-header"><h5 class="modal-title">'+filename+'</h5></div><div class="modal-body" style="background-color: #ddd"><img src="img/tempPreviewImg'+filetype+'?'+Date.now().toString()+'"/></div><div class="modal-footer"><button type="button" class="btn btn-primary">Выбрать</button></div>');
				$('.modal-body #file_preview_in .btn-primary').on('click', fileSelected);
			}
		});
	}
});

function parseParametrs(query) {
	var vars = query.split("&");
	var query_string = {};
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		var key = decodeURIComponent(pair[0]);
		var value = decodeURIComponent(pair[1]);
		if (typeof query_string[key] === "undefined") {
			query_string[key] = decodeURIComponent(value);
		} else if (typeof query_string[key] === "string") {
			var arr = [query_string[key], decodeURIComponent(value)];
			query_string[key] = arr;
		} else {
			query_string[key].push(decodeURIComponent(value));
		}
	}
	return query_string;
}
});