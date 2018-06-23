const routes = require('./routes');
module.exports = function(server, db) {
	routes(server, db);
};