$(document).ready(function() {
	const socket = io.connect('http://localhost:8000');

	function get_cookie ( cookie_name ) {	//получение значения cookie
		var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
		if ( results ) return ( unescape ( results[2] ) );
		else return null;
	}

	var uName = get_cookie("username");
	var idCookie = get_cookie("moydvgups_admin_id");

	socket.emit("getLastEvents", idCookie);
	socket.on("setLastEvents", (result, userId) => {
		if (userId == idCookie) {
			for (var i = result.events.length-1; i >= 0; i--) {
				$('#last_events').append('<li class="list-group-item">[ '+convertDate(result.events[i].date)+' ] '+result.events[i].text+'</li>');
			}
		}
	});

	function convertDate(timestamp){
		var months_arr = ['01','02','03','04','05','06','07','08','09','10','11','12'];
		var date = new Date(timestamp);
		var year = date.getFullYear();
		var month = months_arr[date.getMonth()];
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		return day+'.'+month+'.'+year+' '+hours + ':' + minutes.substr(-2);
	}
	
	socket.emit("getChat", idCookie);
	console.log("getting_chat");

	socket.on("setChat", (chat) => {
		console.log("setting_chat");
		$('.panel').remove();
		$('#chat_window').append('<div class="panel panel-default"><div class="panel-footer"><div class="form-inline"><textarea type="text" class="form-control" id="chat_textarea" placeholder="Ваше сообщение..."></textarea><button class="btn btn-primary" id="chat_send_btn">Отправить</button></div><div class="msg_container_base"><ul class="list-group" id="chat_messages"></ul></div></div></div>')
		for (var i = chat.messages.length-1; i >= 0; i--) {
			$('#chat_messages').append('<li class="list-group-item"><small>'+convertDate(chat.messages[i].date)+'</small><b>'+chat.messages[i].sender+'</b><p>'+chat.messages[i].text+'</p></li>');
		}
		$('#chat_send_btn').on('click', sendMessage);

		function sendMessage(event) {
			if ($('#chat_textarea').val() != "") {
				var newMessage = {
					"date": Date.now(),
					"sender": uName,
					"text": $('#chat_textarea').val()
				}
				socket.emit('newMessage', newMessage, idCookie);
			}
		}
	});
});