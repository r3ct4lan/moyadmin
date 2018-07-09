$(document).ready(function() {
	var parametrs = parseParametrs(window.location.search.match(/\?(.*)/)[1]);
	switch (parametrs.enteringerror) {
		case '0':
			$('.row').prepend('<div class="alert alert-danger" role="alert">Неверное имя пользователя или пароль!<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
			break;
		case '1':
			$('.row').prepend('<div class="alert alert-danger" role="alert">Внимание! Заполните все поля формы.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
			break;
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