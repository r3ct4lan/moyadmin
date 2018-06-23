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

	socket.emit("getAll", idCookie);
	socket.on("setAll", function(structure, colors, userId) {
		if (userId == idCookie) {
			for (var j=0; j<structure.sections.length; j++) {
				$("#sections").append('<li class="list-group-item" data-item="'+j+'"><div class="section_name">'+structure.sections[j].title+' ('+structure.sections[j].size+')</div><div class="content_buttons"><img class="content_up" src="img/up-arrow.svg"><img class="content_down" src="img/down-arrow.svg"><img class="content_edit" src="img/pencil.svg"><img class="content_delete" src="img/delete.svg"></div></li>');
			}
			$('.content_edit').on('click', sectionEdit);

			function sectionEdit(event) {
				var secNum = parseInt($(this).closest('li').attr('data-item'), 10);
				window.location.replace("/section?"+secNum);
			}
		}
	});
});