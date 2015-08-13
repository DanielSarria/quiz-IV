var models = require('../models/models.js');
			
//Comprueba si el usuario esta registrado o no en users
//Si la authenticacion falla o hay errores se ejecuta callback(error)
exports.autenticar = function(login, password, callback) {
	models.User.find({
		where: {username: login}
	}).then(function(user) {
		if(user) {
			if(user.verifyPassword(password)) {
				callback(null, user);
			}
			else {
				callback(new Error('Password erroneo.'));
			}
		} else {
			if(login === '') callback(new Error('El campo usuario es obligatorio'));
			else callback(new Error('No existe user='+login));
		}
	}).catch(function(error){callback(error)});
};