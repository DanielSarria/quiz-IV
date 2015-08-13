// Modelo de User con validacion y encriptacion de passwords

var crypto = require('crypto');

// Como estamos en un entorno de pruebas y desarrollo, a parte que hemos permitido que se suba al cvs el fichero que contiene las variables de entorno
// para que se ejecuten en el servidor, hago esto, si ejecuto con npm start, le paso el string, si ejecuto con foreman start que emula servidor, la 
// variable de entorno ira informada. En un entorno real, no publicaria las variables de entorno y ejecutaria con foreman start para evitar tener que publicar
// variables de entorno en el codigo. 
var key = (process.env.PASSWORD_ENCRYPTION_KEY || "asdfghjklzxcvbnmqwertyuiop"); //Para evitar esta linea en entornos reales. Esta linea de codigo y pasar las claves en texto plano es lo mismo.

module.exports = function(sequelize, DataTypes) {
	var User=sequelize.define('User',
		{
			username: {
				type: DataTypes.STRING,
				unique: true,
				validate: {
					notEmpty: {msg: "-> Falta username"},
					// -> devuelve mensaje de error is username ya existe
					isUnique: function(value, next) {
						var self = this;
						User.find({where: {username: value}})
						.then(function (user) {
							if(user && self.id !== user.id) {
								return next('Username ya utilizado');
							}
							return next();
						}).catch(function (err) {return next(err);});
					}
				}
			},
			
			password: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta password"}},
				set: function (password) {
					var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
					
					// Evita passwords vacios
					if(password==='') encripted = '';
					this.setDataValue('password', encripted);
				}
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			}
		},
		{
			instanceMethods: {
				verifyPassword: function (password) {
					var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
					return encripted === this.password;
				}	
			}
		}
	);
	return User;
};