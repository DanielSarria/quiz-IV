var models = require('../models/models.js');

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
	res.render('comments/new.ejs',	{quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
	var comment = models.Comment.build({
		texto:	req.body.comment.texto,
		QuizId:	req.params.quizId 		//Como esta columna es autogenerada, tendriamos que entrar en bbdd para ver como se llama o entendemos que ColumnaFK = Modelo+Id
	});

	comment.validate().then(
		function(err) {
			if(err) {
				res.render('comments/new.ejs', {comment: comment, quizid: req.params.quizId, errors: err.errors});
			} else {
				comment //save: guarda en DB el campo "texto" de la tabla comment
				.save().then(function() {
					res.redirect('/quizes/'+req.params.quizId);
				});
			}
		}
	).catch(function(error){
		next(error);
	});
};

