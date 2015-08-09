var models = require('../models/models.js');
var Sequelize = require('sequelize');

var estadisticas = {preguntas: 0, comentarios: 0, mediaComentariosPreguntas: 0, preguntaSinComentarios: 0, preguntasConComentarios: 0};
var errors = [];
// GET /quizes/statistics
exports.index = function(req,res,next) {
	// Ejecucion de querys usando las promesas de secuelize. Ejecuta las querys en paralelo
	Sequelize.Promise.all([
		//querys ORM-sequelize
		//cuenta el numero de preguntas
		models.Quiz.count(),
		
		//Cuenta el numero de comentarios que estan publicados (los que no estan aprobados no se cuentan)
		models.Comment.count({where: {publicado: true}}),
		
		//Cuenta el numero de preguntas que SI tienen comentarios
		models.Quiz.count({
			distinct: true,
			include: [{
				model: models.Comment,
				where: {publicado: true}
			}]
		})
		
	]).then(function(resultados) {
		//resultados de las querys de arriba
		estadisticas["preguntas"]=resultados[0];
		estadisticas["comentarios"]=resultados[1];
		estadisticas["preguntasConComentarios"]=resultados[2];

		
	}).catch(function(error){next(error);
	}).finally(function() {
		//una vez ejecutadas las querys, renderizas la vista con las estadisticas
		var mediaPreguntas = Math.floor(estadisticas["comentarios"]/estadisticas["preguntas"]);
		if(isNaN(mediaPreguntas) && !isFinite(mediaPreguntas)) mediaPreguntas=0;
		console.log("mediaPreguntas = "+mediaPreguntas);
		estadisticas["preguntaSinComentarios"]=estadisticas["preguntas"]-estadisticas["preguntasConComentarios"];
		estadisticas["mediaComentariosPreguntas"]=mediaPreguntas;
		res.render('quizes/statistics',{errors: [], estadisticasNum: estadisticas});
	});
};

