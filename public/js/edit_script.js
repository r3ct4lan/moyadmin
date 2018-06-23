$(document).ready(function() {
	const socket = io.connect('http://localhost:8000');
	function get_cookie ( cookie_name ) {	//получение значения cookie
	  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
	  if ( results ) return ( unescape ( results[2] ) );
	  else return null;
	}
	const idCookie = get_cookie("moydvgups_admin_id");

	var parametrs = parseParametrs(window.location.search.match(/\&(.*)/)[1]);
	socket.emit("getArticle", parametrs.pageAlias, idCookie);
	socket.on("setArticle", (page, menu, colors, userId) => {
		if (userId == idCookie) {
			if (page) {
				$('#edit_area').append('<div id="prev_area"><section class="pageTopPict" style="background-image: url(http://moydvgups.ru'+page.backgr+');"><div class="pageTopPictMask trColorNumber"></div><div class="container"><div class="row"><div class="offset-md-1 col-md-10"><div class="textPic"><div class="iconblockFlat colorNumber"><img src="http://moydvgups.ru'+page.icon+'"></div><p>'+page.title+'</p></div></div></div></div></section><section class="flatFont"><div class="container"> </div></section></div>');
				setContent(page, menu, colors);
			} else {
				$('#edit_area').append('<br><div class="alert alert-danger"><strong>Ошибка!</strong> Запрошенная статья не существует.</div>');
			}
		}
	});

	function setContent(page, menu, colors) {
		for (var i = 0; i < page.content.length; i++) {
			if (page.content[i].secTitle != "") {
				$('#prev_area > .flatFont > .container').append('<section data-item="'+i+'" class="content_sec"><div class="row"><div class="offset-md-1 col-md-10"><h2 class="textColorNum">'+page.content[i].secTitle+'</h2><div class="content_buttons section_buttons"><img class="content_add" src="img/adding.svg"><img class="content_up" src="img/up-arrow.svg"><img class="content_down" src="img/down-arrow.svg"><img class="content_edit" src="img/pencil.svg" data-toggle="modal" data-target="#change_title"><img class="content_delete" src="img/delete.svg"></div></div></div><div class="row"><div class="col-md-12"><hr noshade=""></div></div><div class="row"><div class="offset-md-1 col-md-10"></div></div></section>');
			} else {
				$('#prev_area > .flatFont > .container').append('<section data-item="'+i+'" class="content_sec"><div class="row"><div class="offset-md-1 col-md-10"><div class="content_buttons section_buttons"><img class="content_add" src="img/adding.svg"><img class="content_up" src="img/up-arrow.svg"><img class="content_down" src="img/down-arrow.svg"><img class="content_edit" src="img/pencil.svg" data-toggle="modal" data-target="#change_title"><img class="content_delete" src="img/delete.svg"></div></div></div><div class="row"><div class="col-md-12"><hr noshade=""></div></div><div class="row"><div class="offset-md-1 col-md-10"></div></div></section>');
			}
			var currentSec = $('section[data-item="'+i+'"]').children().last().children('div');
			for (var j = 0; j < page.content[i].elements.length; j++) {
				if (page.content[i].elements[j].type == "subtitle") {
					currentSec.append('<h3>'+page.content[i].elements[j].text+'</h3>');
				}
			}
		}
		$('.content_sec').hover(displayButtons, hideButtons);
		function displayButtons(event){
			$(this).children('div').children('div').children('.section_buttons').css('display', "inline-block");
		}
		function hideButtons(event){
			$(this).children('div').children('div').children('.section_buttons').css('display', "none");
		}
		setColors(page, menu, colors);
		$('.section_buttons > .content_up').on('click', sectionUp);
		$('.section_buttons > .content_down').on('click', sectionDown);
		$('.section_buttons > .content_edit').on('click', sectionEdit);
		$('.section_buttons > .content_delete').on('click', sectionDelete);

		function sectionUp(event) {
			var secNum = parseInt($(this).closest('section').attr('data-item'), 10);
			if (secNum != 0) {
				var temp = page.content[secNum];
				page.content[secNum] = page.content[secNum-1];
				page.content[secNum-1] = temp;
				$('#prev_area > .flatFont > .container > section').remove();
				setContent(page, menu, colors);
			}
		}

		function sectionDown(event) {
			var secNum = parseInt($(this).closest('section').attr('data-item'), 10);
			if (secNum != page.content.length-1) {
				var temp = page.content[secNum];
				page.content[secNum] = page.content[secNum+1];
				page.content[secNum+1] = temp;
				$('#prev_area > .flatFont > .container > section').remove();
				setContent(page, menu, colors);
			}
		}

		function sectionEdit(event) {
			var secNum = parseInt($(this).closest('section').attr('data-item'), 10);
			$('#change_title').on('show.bs.modal', function () {
				$('#change_title-text').val(page.content[secNum].secTitle);

				$('#change_title .btn-primary').click(function () {
					page.content[secNum].secTitle = $('#change_title-text').val();
					$('#prev_area > .flatFont > .container > section').remove();
					setContent(page, menu, colors);
					$('#change_title').modal('hide');
				});
			});
		}

		function sectionDelete(event) {
			var secNum = parseInt($(this).closest('section').attr('data-item'), 10);
			if (confirm('Вы действительно хотите удалить данную чать статьи?')) {
				page.content.splice(secNum, 1);
				$('#prev_area > .flatFont > .container > section').remove();
				setContent(page, menu, colors);
			}
		}
	}

	function setColors(page, menu, colors) {
		var colorNumber = menu.sections[page.sectionNum].colorNum;
		for (var i = 0; i<colors.color.length; i++) {
			if (colors.color[i].number == colorNumber) {
				$('.trColorNumber').css('background-color', colors.color[i].back);
				$('.colorNumber').css('background', colors.color[i].code);
				$('.textColorNum').css('color', colors.color[i].text);
			}
		}
	}

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