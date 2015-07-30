//Aunque el tema es un campo obligatorio y por seguridad lo seteamos por defecto al valor "otro"
//no permitimos que los temas vallan vacios. 

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Quiz',
		{
			pregunta:	{
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta Pregunta"}}
			},
			respuesta: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta Respuesta"}}				
			},
			tema: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta Tema"}}				
			}
		});
};