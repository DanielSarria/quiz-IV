var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials'); 
var methodOverrride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//instala el modulo express-partials
app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded()); //deprecado, equivale a extend: true
app.use(bodyParser.urlencoded({ extended: true })); //no aparece el warning de middleware deprecado
app.use(cookieParser('Quiz 2015')); //Semilla para generar la sesion
app.use(session());
app.use(methodOverrride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function(req, res, next) {
	//guardar el path en session.redir para redireccionar a la vista anterior
	
	//inicializo el path de la sesion, para corregir el bug localhost:5000/login Ya que al logarse, antes se producia un error que no encontraba el path
	if(!req.session.redir) req.session.redir="/";
	if(!req.path.match(/\/login|\/logout/)) {
		req.session.redir=req.path;
	}
	
	// Hacer visible la session en las vistas
	res.locals.session = req.session;	
	next();
});

// Gestion de la duracion de la session. Si el servidor tarda mas de 2 minutos en recibir una peticion http, la session caduca.
// NOTA: Tenemos un redirect automatico en login y logout. Por ejemplo, cuando clickamos en logout, y pasamos por los middlewares de apps, seguimos
// manteniendo la session, aun no se ha destruido. Pero como en logout hacemos una redireccion al recurso anterior, entonces volvemos a pasar
// por los middlewares de apps pero esta vez con la session destruida.    
app.use(function(req, res, next) {
	//La seteamos a false para que no vuelve a pintarla en la pagina.
	if(req.session.sessionCaducada) req.session.sessionCaducada=false;
	
	//gestiona la caducidad de la session
	if(req.session.user) {
		var tiempoAct = new Date().getTime();
		if(req.session.tiempo) {
			var diferenciaTiempo = Math.floor((tiempoAct-req.session.tiempo)/1000); //resultado en segundos
			if(diferenciaTiempo > 120) {
				delete req.session.user; 
				delete req.session.tiempo;
				//para mostrar una alerta en la pagina
				req.session.sessionCaducada=true;
			} else { 
				req.session.tiempo = tiempoAct;
				//Si hacemos logout, quitamos la variable tiempo de la session. Para que el tiempo deje de contar.
				if(req.path.match(/\/logout/)) delete req.session.tiempo;
			}
		}else req.session.tiempo = tiempoAct;
	}
	next();
});

app.use('/', routes); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
			errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
		errors: []
    });
});


module.exports = app;
