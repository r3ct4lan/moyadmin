$(document).ready(function() {
	const socket = io.connect('https://moyadmin.herokuapp.com');
	function get_cookie ( cookie_name ) {	//получение значения cookie
		var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
		if ( results ) return ( unescape ( results[2] ) );
		else return null;
	}

	var idCookie = get_cookie("moydvgups_admin_id");

	socket.emit('getUserInfo', idCookie);
	socket.on('setUserInfo', (result, userId) => {
		if (userId == idCookie) {
			var uName = result.username;
			var adminStat = result.adminStatus;
			if(adminStat) {
				$('.mainContainer').prepend('<header><nav class="navbar navbar-expand-lg navbar-dark bg-dark"><a class="navbar-brand" href="/">#moyadmin</a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarText"><ul class="navbar-nav mr-auto"><li class="nav-item"><a class="nav-link" href="/sections">Разделы</a></li><li class="nav-item"><a class="nav-link" href="/articles">Статьи</a></li><li class="nav-item"><a class="nav-link" href="#">Файлы</a></li></ul><ul class="navbar-nav"><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+uName+'</a><div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown"><a class="dropdown-item" href="/profile">Личный кабинет</a><a class="dropdown-item" href="/invite">Пригласить пользователя</a><div class="dropdown-divider"></div><a class="dropdown-item" href="#" id="account_exit">Выйти</a></div></li></ul></div></nav></header>');
			} else {
				$('.mainContainer').prepend('<header><nav class="navbar navbar-expand-lg navbar-dark bg-dark"><a class="navbar-brand" href="/">#moyadmin</a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarText"><ul class="navbar-nav mr-auto"><li class="nav-item"><a class="nav-link" href="/sections">Разделы</a></li><li class="nav-item"><a class="nav-link" href="/articles">Статьи</a></li><li class="nav-item"><a class="nav-link" href="#">Файлы</a></li></ul><ul class="navbar-nav"><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+uName+'</a><div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown"><a class="dropdown-item" href="/profile">Личный кабинет</a><div class="dropdown-divider"></div><a class="dropdown-item" href="#" id="account_exit">Выйти</a></div></li></ul></div></nav></header>');
			}
			$('#account_exit').click(function () {
				socket.emit("userExit", idCookie);
				document.cookie = 'moydvgups_admin_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				document.location.href = "/";
			});
		}
	});

	$('body').append('<div id="hFooter"></div><footer><nav class="navbar navbar-dark bg-dark"><a class="navbar-brand" href="http://moydvgups.ru">#moydvgups</a><span class="navbar-text">По всем вопросам: rectalanal@hotmail.com</span></nav></footer>');
});