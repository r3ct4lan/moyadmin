$(document).ready(function() {
	const socket = io.connect('https://moyadmin.herokuapp.com');
	function get_cookie ( cookie_name ) {	//получение значения cookie
		var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
		if ( results ) return ( unescape ( results[2] ) );
		else return null;
	}

	var idCookie = get_cookie("moydvgups_admin_id");
	var uName;

	socket.emit('getUserInfo', idCookie);
	socket.on('setUserInfo', (result, userId) => {
		if (userId == idCookie) {
			uName = result.username;
			$('p#username').append(uName);
			var adminStat = result.adminStatus;
			if(adminStat) {
				$('p#admStatus').append("Администратор");
			} else {
				$('p#admStatus').append("Пользователь");
			}
		}
	});

	$('#ch_username .btn-primary').click(function() {
		var newUName = $('#newUName').val();
		if (newUName != '') {
			socket.emit('changeUserName', newUName, idCookie);
			socket.on("profileError", userId => {
				if (userId == idCookie) {
					alert("Ошибка сервера. Попробуйте ещё раз.");
					window.location.reload();
				}
			});
			socket.on("profileSuccess", userId => {
				if (userId == idCookie) {
					var newEvent = {
						"date": Date.now(),
						"text": "<b>"+uName+"</b> сменил имя на <b>"+newUName+"</b>"
					}
					socket.emit("updateEvents", newEvent, idCookie);
					window.location.reload();
				}
			});
		} else {
			alert("Вы ничего не ввели!");
		}
	});
});