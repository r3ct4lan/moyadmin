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

	socket.emit("getUnpublic", idCookie);
	socket.on("setUnpublic", (struct, userId) => {
		if (userId == idCookie) {
			for (var i = struct.length-1; i>=0; i--) {
				if (struct[i].linkType == "link") {
					$('#articles-unpublic').append('<a class="list-group-item list-group-item-action" href="/titles?unpublic&type=link&num='+i+'">'+struct[i].linkName+' (ссылка)</li>');
				} else if (struct[i].linkType == "article") {
					$('#articles-unpublic').append('<a class="list-group-item list-group-item-action" href="/titles?unpublic&type=link&num='+i+'">'+struct[i].linkName+' (статья)</li>');
				}
			}
		}
	});

	socket.emit("getAll", idCookie);
	socket.on("setAll", function(structure, colors, userId) {
		if (userId == idCookie) {
			for (var i = 0; i<structure.sections.length; i++) {
				for (var j = 0; j < structure.sections[i].content.length; j++) {
					if (structure.sections[i].content[j].linkType == "link") {
						$('#articles-all').append('<a class="list-group-item list-group-item-action" href="/titles?titles&type=link&secNum='+i+'">'+structure.sections[i].content[j].linkName+' (ссылка)</li>');
					} else if (structure.sections[i].content[j].linkType == "article") {
						$('#articles-all').append('<a class="list-group-item list-group-item-action" href="/edit?page&pageAlias='+structure.sections[i].content[j].linkAddress.replace('.html', '')+'">'+structure.sections[i].content[j].linkName+' (статья)</li>');
					}
				}
			}
		}
	});
});