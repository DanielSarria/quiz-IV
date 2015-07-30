var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

/* GET author page. */
router.get('/author', function(req, res) {
	res.render('author', {errors: []});
});

// Autoload de comandos si existe el parametro :quizId
router.param('quizId',quizController.load);

//Definicion de rutas de /quizes 
router.get('/quizes', 							quizController.index);
router.get('/quizes/:quizId(\\d+)', 			quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',		quizController.answer);
router.get('/quizes/new',						quizController.new);
router.post('/quizes/create',					quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',		quizController.edit);
router.put('/quizes/:quizId(\\d+)',				quizController.update);

//encapsulamos el recurso REST DELETE, en la peticion POST para que no se cacheé
router.delete('/quizes/:quizId(\\d+)',			quizController.destroy);

module.exports = router;
