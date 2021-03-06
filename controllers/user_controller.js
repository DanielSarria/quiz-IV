var models = require('../models/models.js');

// Autoload :userId
exports.load = function(req, res, next, userId) {
	models.User.find({where: {id: Number(userId)}})
	.then(function(user) {
		if(user) {
			req.user=user;
			next();
		}else{
			next(new Error('No existe userId='+userId));
		}
	}).catch(function(error){next(error)});
};

			
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

exports.new=function(req,res) {
	var user = models.User.build( // crea objeto user
		{username: "", password: ""}
	);
	res.render('user/new', {user: user, errors: []});
};

// POST/user
exports.create=function(req,res,next) {
	var user=models.User.build(req.body.user);

	user.validate().then(function(err){
		if(err){
			res.render('user/new', {user: user, errors: err.errors});
		}else{
			//save: guarda campo username y password en DB
			user.save(
				{fields: ["username", "password"]}
			).then(function(){
				// crea la sesion con el usuario ya autenticado y redirige a /
				req.session.user = {id:user.id, username:user.username};
				res.redirect('/');
			});
		}
	}).catch(function(error){next(error)});
};

// GET /user/:id/edit
exports.edit=function(req,res) {
	res.render('user/edit', {user: req.user, errors: []}); //req.user: instancia de user cargada con autoload
};

// PUT /user:id
exports.update=function(req,res) {
	req.user.username = req.body.user.username;
	req.user.password = req.body.user.password;
	
	req.user.validate().then(function(err){
		if(err){
			res.render('user/' + req.user.id, {user: req.user, errors: err.errors});
		}else{
			//save: guarda campo username y password en DB
			req.user.save(
				{fields: ["username", "password"]}
			).then(function(){res.redirect('/');});
		}
	}).catch(function(error){next(error)});
};

// DELETE /user/:id
exports.destroy=function(req,res) {
	req.user.destroy().then(function() {
		// borra la sesion y redirige a /
		delete req.session.user;
		res.redirect('/');
	}).catch(function(error){next(error)});
};