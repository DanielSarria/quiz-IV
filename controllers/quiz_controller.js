var models = require('../models/models.js');

// Autoload - factoriza el codigo si la ruta incluye el parametro :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if(quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId='+quizId)); }
		}
	).catch(function(error){next(error);});
};


// GET /quizes/:id
exports.index = function(req,res) {
	var inputValueSearch = (req.query.search || "texto_a_buscar");
	var search = '%';
	
	if(req.query.search) {
		search=search+req.query.search+'%';
		search=search.replace(/\s+/g,'%');
	} 
	
	models.Quiz.findAll(
		{
			where: ["lower(pregunta) like lower(?)",search],
            order: 'pregunta ASC'
		}
	).then(function(quizes) {
		res.render('quizes/index',{quizes: quizes, search: inputValueSearch, errors: []});
	}).catch(function(error){next(error);});
};


// GET /quizes/:id
exports.show = function(req,res) {
	res.render('quizes/show',{quiz: req.quiz, errors: []});
};


// GET /quizes/:id/answer
exports.answer = function(req,res) {
	var resultado = 'Incorrecto';
	if(req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer',{quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req,res) {
	var quiz=models.Quiz.build( //crea objeto quiz
		{
			pregunta:   "Pregunta",
			respuesta:  "Respuesta",
			tema:		"otro"
		}
	);
	
	var pintarOpcion = { otro: "", humanidades: "", ocio: "", ciencia: "", tecnologia:""}; 
	res.render('quizes/new',{quiz: quiz, errors: [], selected: pintarOpcion});
};

// POST /quizes/create
exports.create = function(req,res) {
	var pintarOpcion = { otro: "", humanidades: "", ocio: "", ciencia: "", tecnologia:""};
	var quiz=models.Quiz.build( req.body.quiz );
	//guarda en DB los campos pregunta y respuesta de quiz solamente
	//para evitar ataques desde POST que añadan campos adicionales a la tabla.
	//para evitar que añadan temas adicionales
	var tema =  quiz.tema;
	if(tema !== "otro" && tema !== "humanidades" && tema !== "ocio" && tema !== "ciencia" && tema !== "tecnologia") {
		quiz.tema="otro";
	}
	
	quiz
	.validate()
	.then(
		function(err) {
			if(err) {
				res.render('quizes/new',{quiz: quiz, errors: err.errors, selected: pintarOpcion});
			}else{
				quiz.save(
					{
						fields: ["pregunta","respuesta","tema"]
					}
					).then(function(){
						res.redirect('/quizes');
					}	
				);			
			}
		}
	);
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz; //Autoload de instancia de quiz
	var pintarOpcion = { otro: "", humanidades: "", ocio: "", ciencia: "", tecnologia:""}; 
	
	res.render('quizes/edit', {quiz: quiz, errors: [], selected: pintarOpcion});
};


// PUT /quizes/:id
exports.update = function(req, res) {
	var pintarOpcion = { otro: "", humanidades: "", ocio: "", ciencia: "", tecnologia:""};
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;
	
	//para evitar que nos cambien el tema por uno que no tenemos en el componente html select
	var tema = req.quiz.tema;
	if(tema !== "otro" && tema !== "humanidades" && tema !== "ocio" && tema !== "ciencia" && tema !== "tecnologia") {
		req.quiz.tema="otro";
	}

	req.quiz
	.validate()
	.then(
		function(err) {
			if(err) {
				res.render('quizes/edit',{quiz: req.quiz, errors: err.errors, selected: pintarOpcion});
			}else{
				req.quiz.save(
					{
						fields: ["pregunta","respuesta", "tema"]
					}
					).then(function(){
						res.redirect('/quizes');
					}	
				);			
			}
		}
	);	
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};

