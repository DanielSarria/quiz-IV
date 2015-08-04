// MW de autorizacion de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
	if(req.session.user) {
		next();
	}else{
		res.redirect('/login');
	}
};

// Get /login 	-- Formulario de login
exports.new = function(req,res) {
	var errors = req.session.errors || {};
	req.session.errors = {};
	
	res.render('sessions/new', {errors: errors});
};


// POST /login 	--Crear la session
exports.create = function(req, res) {
	var login = req.body.login;
	var password = req.body.password;

	var userController = require('./user_controller');
	userController.autenticar(login, password, function(error, user) {
		//si hay error retornamos mensajes de error de session
		if(error) {
			req.session.errors=[{"message": 'Se ha producido un error: '+error}];
			res.redirect("/login");
			return;
		}
		
		// Crea req.session.user y guarda los campos id y username
		// la session se define por la existencia de: req.session.user
		req.session.user = {id:user.id, username:user.username};
		res.redirect(req.session.redir.toString()); //redireccion al path anterior a login
	});
};


// DELETE /logout 	--Destruir session
exports.destroy = function(req, res) {
	delete req.session.user;
	res.redirect(req.session.redir.toString()); //redireccion al path anterior a login
};