var path = require('path');

//Se preparan las variables, segun ejecutemos sqlite en local 
//o postgress en heroku

//esto es para poder ejecutar en local con npm start
//ya que si ejecutamos npm start, no cogemos las variables de entorno .ent, y DATABASE_URL es undefined y da error en el match
var getEnv = process.env.DATABASE_URL;
var getStorage = process.env.DATABASE_STORAGE;
if(!getEnv) getEnv="sqlite://:@:/";
if(!getStorage) getStorage="quiz.sqlite";

var url = getEnv.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name		= (url[6] || null);
var user		= (url[2] || null);
var pwd			= (url[3] || null);
var protocol	= (url[1] || null);
var dialect		= (url[1] || null);
var port		= (url[5] || null);
var host		= (url[4] || null);
var storage		= getStorage;

//cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o postgress
var sequelize = new Sequelize(DB_name, user, pwd,
						{dialect: protocol, 
						protocol: protocol,
						port:	  port,
						host:	  host,
						storage:  storage,
						omitNull: true
						}
					);
					
//Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

// Importar definicion de la tabla User
var User = sequelize.import(path.join(__dirname, 'user'));

//Relaciones tablas
// 1-a-1: belongsTo(...modelo...) 	     - A - 	  hasOne(...modelRelacion...)
// 1-a-N: belongsTo(...modelo...) 		 - A - 	  hasMany(...modelRelacion...)
// N-a-N: belongsToMany(...modelo...)	 - A -    belongsToMany(...modelRelacion...)

//relacion de la tabla quiz con comment del tipo 1-N
//Sequelize añade la relaciona la tabla comment la columna QuizId
//como clave foranea para poder relacionar las dos tablas. 
Comment.belongsTo(Quiz, { onDelete: 'cascade'}); //1
Quiz.hasMany(Comment, { onDelete: 'cascade'});   //N

//Relacion User (1) - Quiz (N)
Quiz.belongsTo(User, {onDelete: 'cascade'});
User.hasMany(Quiz, {onDelete: 'cascade'});

//Exportar tablas
exports.Quiz = Quiz; // exportar definicion de tabla Quiz
exports.Comment = Comment; // Export la definicion de la tabla Comment
exports.User = User;

// sequelize.sync() Crea e inicializa la tabla de preguntas en BD
sequelize.sync().then(function() {
	// then(..) Ejecuta el manejador una vez creada la tabla
	User.count().then(function (count) {
		if(count === 0) {
			User.bulkCreate(
				[
					{username: 'admin', password: '1234', isAdmin: true},
					{username: 'pepe', password: '5678'} // por defecto isAdmin es false a si que no se le pasa como parametro.
				]
			).then(function() { 
				console.log('Base de datos (Tabla User) inicializada');
				Quiz.count().then(function(count){
					if(count === 0) { //la tabla se inicializa solo si esta vacia
						Quiz.bulkCreate(
							[
								{
									pregunta: 'Autor de la escultura El David',
									respuesta: 'Miguel Angel',
									tema: 'humanidades',
									UserId: 2	
								},
								{
									pregunta: 'Capital de Portugal',
									respuesta: 'Lisboa',
									tema: 'otro',
									UserId: 2	
								},
								{
									pregunta: 'Actor que interpreta al décimo Doctor Who',
									respuesta: 'David Tennant',
									tema: 'ocio',
									UserId: 1	
								},
								{
									pregunta: 'La estrella más cercana a la tierra',
									respuesta: 'Sol',
									tema: 'ciencia',
									UserId: 2	
								},
								{
									pregunta: '¿Qué significan las siglas IA?',
									respuesta: 'Inteligencia Artificial',
									tema: 'tecnologia',
									UserId: 2	
								}
							]
						).then(function(){console.log('Base de datos inicializada');});
					}
				});
			});
		}
	});
});

