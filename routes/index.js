var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var statisticsController = require('../controllers/statistics_controller');
var userController = require('../controllers/user_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

/* GET author page. */
router.get('/author', function(req, res) {
	res.render('author', {errors: []});
});

// Autoload de comandos si existe el parametro :quizId
router.param('quizId',quizController.load); // autoload :quizId
router.param('commentId',commentController.load); // autoload :commentId
router.param('userId', userController.load); //autoload :userId

// Definicion de rutas de sesion
router.get('/login',		sessionController.new); 	// formulario login
router.post('/login',		sessionController.create);	// crear session
router.get('/logout',		sessionController.destroy);	// destruir session

//Definicion de rutas de cuenta
router.get('/user', userController.new); 	// formulario login
router.post('/user', userController.create);	// formulario usuario
router.get('/user/:userId(\\d+)/edit', sessionController.loginRequired, userController.edit);
router.put('/user/:userId(\\d+)', sessionController.loginRequired, userController.update);
router.delete('/user/:userId(\\d+)', sessionController.loginRequired, userController.destroy);


//Estadisticas
router.get('/quizes/statistics',				statisticsController.index);

//Definicion de rutas de /quizes 
router.get('/quizes', 							quizController.index);
router.get('/quizes/:quizId(\\d+)', 			quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',		quizController.answer);
router.get('/quizes/new',						sessionController.loginRequired, quizController.new);
router.post('/quizes/create',					sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',		sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',				sessionController.loginRequired, quizController.update);

//encapsulamos el recurso REST DELETE, en la peticion POST para que no se cacheé
router.delete('/quizes/:quizId(\\d+)',			sessionController.loginRequired, quizController.destroy);

//Interfaces REST del controlador comment_controller
router.get('/quizes/:quizId(\\d+)/comments/new',		commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',			commentController.create);
//En el curso usamos GET, pero lo correcto para seguir la metodologia REST deberiamos usar route.put(...)
//por que vamos a actualizar una columna de la tabla comentarios.
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.loginRequired, commentController.publish);

module.exports = router;
