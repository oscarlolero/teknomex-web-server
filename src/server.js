const express = require('express');
const app = express();

const path = require('path'); //manejar rutas/direcciones del servidor
// const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan'); //logeo de peticiones http
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); //procesar información desde el navegador al servidor
const session = require('express-session');

// require('./config/passport')(passport); //Configurar passsport

//Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); //Configurar motor de plantillas

//Configurar y probar conexión a base de datos..

//middlewares
// app.use(morgan('dev')); //Logeo de peticiones al servidor
app.use(cookieParser());
app.use(bodyParser.json()); //se pasa la funcion "json" como middlewere a express.
app.use(session({
    secret: 'kajwg45s2',
    resave: false,
    saveUninitialized: false
}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());

//Rutas
// require('./app/routes')(app, passport);
require('./app/routes')(app);

//Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Handle 404
// app.use((req, res) => {
//     res.redirect('/login');
// });

app.listen(app.get('port'), () => {
    console.log('Server encendido en puerto', app.get('port'));
});