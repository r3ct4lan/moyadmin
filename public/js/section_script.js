Dropzone.autoDiscover = false;
$(document).ready(function() {
	const socket = io.connect('http://localhost:8000');

	function get_cookie ( cookie_name ) {	//получение значения cookie
		var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
		if ( results ) return ( unescape ( results[2] ) );
		else return null;
	}

	const uName = get_cookie("username");
	const idCookie = get_cookie("moydvgups_admin_id");
	const sectionNum = window.location.search.replace('?', '');

	socket.emit("getAll", idCookie);
	socket.on("setAll", function(structure, colors, userId) {
		if (userId == idCookie) {
			$('#section_name').append(structure.sections[sectionNum].title);
			$(".section_view").append('<div class="col-md-' + structure.sections[sectionNum].size + ' col-sm-12 col-xs-12"><div class="tile" style="background-image: url(http://moydvgups.ru/' + structure.sections[sectionNum].background + ')"><div class="tile-info trColor' + structure.sections[sectionNum].colorNum + '"><div class="tileTextBlock">' + structure.sections[sectionNum].title + '<div class="iconblock color' + structure.sections[sectionNum].colorNum + '"><img src="http://moydvgups.ru/' + structure.sections[sectionNum].icon + '"></div></div><div class="clearfix"></div><div><ul>');
			for (var j=0; j<structure.sections[sectionNum].content.length; j++) {
				$('.section_view > div:last-child > div > div > div:last-child > ul').append( '<li><a href="' + structure.sections[sectionNum].content[j].linkAddress + '">' + structure.sections[sectionNum].content[j].linkName + '</a></li>' );
			}
			$(".section_view").append( '</ul></div></div></div></div>' );

			var colorClassNumber = $('.tile-info').attr('class').substr($('.tile-info').attr('class').lastIndexOf('r')+1, $('.tile-info').attr('class').length);
			var colorNumber;
			for (var i = 0; i<colors.color.length; i++) {
				if (colors.color[i].number == colorClassNumber) colorNumber = i;
			}
			$('.iconblock').css('background-color', colors.color[colorNumber].code);
			$('.tile-info').css('background-color', colors.color[colorNumber].back);

			$('.example_view > div').attr('class', 'col-md-12');

			$('#ch_sec_title').on('show.bs.modal', function () {
				$('#ch_sec_title-text').val(structure.sections[sectionNum].title);

				$('#ch_sec_title .btn-primary').click(function () {
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> изменил заголовок раздела <b>"+structure.sections[sectionNum].title+"</b> на <b>"+$('#ch_sec_title-text').val()+"</b>"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					structure.sections[sectionNum].title = $('#ch_sec_title-text').val();
					socket.emit("updateMenuStructure", structure, idCookie);
					window.location.reload();
				});
			});

			$('#ch_sec_color').on('show.bs.modal', function () {
				for (var i = 0; i < colors.color.length; i++) {
					if (colors.color[i].number == structure.sections[sectionNum].colorNum) {
						$('select#colorselector').append('<option value="' + colors.color[i].number + '" data-color="' + colors.color[i].code + '" selected="selected">color #' + colors.color[i].number + '</option>');
						$(".example_view #article_title").attr('style', 'color:' + colors.color[i].text);
					} else {
						$('select#colorselector').append('<option value="' + colors.color[i].number + '" data-color="' + colors.color[i].code + '">color #' + colors.color[i].number + '</option>');
					}
				}
				$('#ch_sec_color .modal-body').append("<script>$('#colorselector').colorselector();</script>");

				if(!$('a').is('#newColor')) {
					$('.dropdown-colorselector > ul.dropdown-menu').append('<li><a class="color-btn" id="newColor" href="#" data-toggle="modal" data-target="#add_new_color" title="новый"></a></li>');
				}

				$('#ch_sec_color .btn-secondary').click(function () {
					$('.dropdown-colorselector > .dropdown-menu').each(function () {
						for (var i = 0; i<$(this).find('li').length; i++) {
							if ($(".dropdown-colorselector > .dropdown-menu > *:nth-child("+i+") > a").attr('data-value') == structure.sections[sectionNum].colorNum) {
								$(".dropdown-colorselector > .dropdown-menu > *:nth-child("+i+") > a").attr('class', 'color-btn selected');
								$('.btn-colorselector').attr('style', 'background-color: '+$(".dropdown-colorselector > .dropdown-menu > *:nth-child("+i+") > a").attr("data-color")+';');
							} else {
								$(".dropdown-colorselector > .dropdown-menu > *:nth-child("+i+") > a").attr('class', 'color-btn');
							}
						}
					});
				});

				$('#ch_sec_color .btn-primary').click(function () {
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> изменил цвет раздела <b>"+structure.sections[sectionNum].title+"</b>"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					structure.sections[sectionNum].colorNum = $( "#colorselector option:selected" ).val();
					socket.emit("updateMenuStructure", structure, idCookie);
					window.location.reload();
				});

				$('#colorP1').colorpicker('setValue', $(".iconblock").css("background-color"));
				$('#colorP2').colorpicker('setValue', $(".tile-info").css("background-color"));
				$('#colorP3').colorpicker('setValue', $(".example_view #article_title").css("color"));

				$('#colorP1 > input').change(function () {
					$('.example_view .iconblock').attr('style', 'background: ' + $(this).val());
				});
				$('#colorP2 > input').change(function () {
					$('.example_view .tile-info').attr('style', 'background-color: ' + $(this).val());
				});
				$('#colorP3 > input').change(function () {
					$('.example_view #article_title').attr('style', 'color: ' + $(this).val());
				});

				$('#add_new_color .btn-primary').click(function () {
					var number = colors.color.length;
					for (var i = 0; i < colors.color.length; i++) {
						if (number == colors.color[i].number) number++;
					}
					var code = $('#colorP1 > input').val();
					var back = $('#colorP2 > input').val();
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> добавил новый цвет (<b>color #"+number+"</b>)"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					colors['color'].push({"number":number.toString(), "code":code, "back":back});
					socket.emit("addNewColor", colors, idCookie);
					window.location.reload();
				});
			});

			$('#ch_sec_size').on('show.bs.modal', function () {
				$('#size-buttons #'+structure.sections[sectionNum].size).parent().attr('class', 'btn btn-secondary active');
				$('.change_size').append('<div class="col-md-'+structure.sections[sectionNum].size+'"><div id="current-size-block"></div></div><div class="col-md-'+(12-structure.sections[sectionNum].size)+'"><div id="waste-size-block"></div></div>');
				$('#size-buttons > label.btn').click(function () {
					var tempSize = $(this).children().attr('id');
					$('#current-size-block').parent().attr('class', 'col-md-'+tempSize);
					$('#waste-size-block').parent().attr('class', 'col-md-'+(12-tempSize));
				});

				$('#ch_sec_size .btn-primary').click(function () {
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> изменил размер раздела <b>"+structure.sections[sectionNum].title+"</b>"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					structure.sections[sectionNum].size = $('#size-buttons > label.btn.active > input').attr('id');
					socket.emit("updateMenuStructure", structure, idCookie);
					window.location.reload();
				});
			});

			var iconUploader = new Dropzone('#change-icon-dropzone', {
				acceptedFiles: 'image/*',
				paramName: "file",
				maxFiles: 1
			});

			$('#ch_sec_icon').on('show.bs.modal', function () {
				$('#ch_sec_icon #current_img').append('<img src="http://moydvgups.ru/'+structure.sections[sectionNum].icon+'">');
				
				iconUploader.on('success', function( file, resp ){
					$('#current_img>img').attr('src', file.dataURL);
					$('#current_img>img').attr('data-path', "/icons/"+file.name);
					$('#current_img').prev('h6').text("Новое изображение:");
					iconUploader.removeFile(file);
				});

				$('#ch_sec_icon .btn-primary').click(function () {
					if ($('#current_img>img').attr('data-path')) {
						var newEvent = {
							"date": Date.now(),
							"text": "<b>"+uName+"</b> изменил иконку раздела <b>"+structure.sections[sectionNum].title+"</b>"
						}
						socket.emit("updateEvents", newEvent, idCookie);
						structure.sections[sectionNum].icon = 'img'+$('#current_img>img').attr('data-path');
						socket.emit("updateMenuStructure", structure, idCookie);
					}
					window.location.reload();
				});

				$('#ch_sec_icon').on('hidden.bs.modal', function () {
					$('#ch_sec_icon #current_img img').remove();
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

			$('#ch_sec_backgr').on('show.bs.modal', function () {
				$('#ch_sec_backgr #current_img').append('<img src="http://moydvgups.ru/'+structure.sections[sectionNum].background+'">');
				
				backgrUploader.on('success', function( file, resp ){
					$('#current_img>img').attr('src', file.dataURL);
					$('#current_img>img').attr('data-path', "/backgrounds/"+file.name);
					$('#current_img').prev('h6').text("Новое изображение:");
					backgrUploader.removeFile(file);
				});

				$('#ch_sec_backgr .btn-primary').click(function () {
					if ($('#current_img>img').attr('data-path')) {
						var newEvent = {
							"date": Date.now(),
							"text": "<b>"+uName+"</b> изменил фоновое изображение раздела <b>"+structure.sections[sectionNum].title+"</b>"
						}
						socket.emit("updateEvents", newEvent, idCookie);
						structure.sections[sectionNum].background = 'img'+$('#current_img>img').attr('data-path');
						socket.emit("updateMenuStructure", structure, idCookie);
					}
					window.location.reload();
				});

				$('#ch_sec_backgr').on('hidden.bs.modal', function () {
					$('#ch_sec_backgr #current_img img').remove();
					$('body').css({
						'overflow-y': 'auto'
					});
				});
			});

			$('#ch_sec_content').on('show.bs.modal', function () {
				var currentContent = Object.assign([], structure.sections[sectionNum].content);
				var unpublicContent = [];
				renderContentStr();

				$('#ch_sec_content .btn-primary').click(function () {
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> изменил содержимое раздела <b>"+structure.sections[sectionNum].title+"</b>"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					structure.sections[sectionNum].content = Object.assign([], currentContent);
					socket.emit("addUnpublicContent", unpublicContent, idCookie);
					socket.emit("updateMenuStructure", structure, idCookie);
					window.location.reload();
				});

				$('#ch_sec_content').on('hidden.bs.modal', function () {
					$('.content_str').remove();
				});

				function renderContentStr() {
					console.log(currentContent);
					for (var i = 0; i < currentContent.length; i++) {
						$('#content_list').append('<div class="content_str" data-pos="'+i+'"><div class="content_text"><p>'+currentContent[i].linkName+' ('+currentContent[i].linkAddress+')</p></div><div class="content_buttons"><img class="content_up" src="img/up-arrow.svg"><img class="content_down" src="img/down-arrow.svg"><img class="content_edit" src="img/pencil.svg"><img class="content_delete" src="img/delete.svg"></div>');
					}
					$('.content_up').on('click', contentUp);
					$('.content_down').on('click', contentDown);
					$('.content_edit').on('click', contentEdit);
					$('.content_delete').on('click', contentDelete);
				}

				function contentUp(event) {
					var oldNumber = parseInt($(this).parent().parent().attr('data-pos'), 10);
					if (oldNumber != 0) {
						var newNumber = oldNumber - 1;
						var temp = currentContent[newNumber];
						currentContent[newNumber] = currentContent[oldNumber];
						currentContent[oldNumber] = temp;
						$('.content_str').remove();
						renderContentStr();
					}
				}

				function contentDown(event) {
					var oldNumber = parseInt($(this).parent().parent().attr('data-pos'), 10);
					if (oldNumber != currentContent.length-1) {
						var newNumber = oldNumber + 1;
						var temp = currentContent[newNumber];
						currentContent[newNumber] = currentContent[oldNumber];
						currentContent[oldNumber] = temp;
						$('.content_str').remove();
						renderContentStr();
					}
				}

				function contentEdit(event) {
					var strNum = parseInt($(this).parent().parent().attr('data-pos'), 10);
					if (currentContent[strNum].linkType == "article") {
						window.location.replace("/titles?titles&type=article&secNum="+sectionNum+"&artAddr="+currentContent[strNum].linkAddress);
					} else {
						window.location.replace("/titles?titles&type=link&secNum="+sectionNum+"&artAddr="+currentContent[strNum].linkAddress);
					}
				}

				function contentDelete(event) {
					var strNum = parseInt($(this).parent().parent().attr('data-pos'), 10);
					if (confirm('Вы действительно хотите удалить "'+currentContent[strNum].linkName+'" из данного раздела?\n\n(При удалении из раздела статья получает статус "неопубликовано").')) {
						unpublicContent.push(currentContent[strNum]);
						$(this).parent().parent().remove();
						currentContent.splice(strNum, 1);
						$('.content_str').remove();
						renderContentStr();
					}
				}
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
					$('#current_img>img').attr('src', 'img/tempPreviewImg'+filetype+'?'+Date.now().toString());
					$('#current_img>img').attr('data-path', path+"/"+filename);
					$('#current_img').prev('h6').text("Новое изображение:");
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
		}
	});
});