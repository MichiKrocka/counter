/***********************************************************
* @file     app.js
* @author   Michael Krocka
* @version  0.0
*
* @brief    Main WEB-server with express.
***********************************************************/
const cfg = require('./config.json');
// .........................................................
var compression  = require('compression'),
    upload       = require('express-fileupload'),
    path         = require('path'),
    favicon      = require('serve-favicon'),
    fs           = require('fs-extra'),
//    rrdtool      = require('rrdtool'),
    child_p      = require('child_process'),
    sprintf      = require('sprintf-js').sprintf,
    express      = require('express'),
    extend       = require('extend'),
    http         = require('http');
// .........................................................
global.sprintf = sprintf;
global.fs      = fs;
global.rrdtool = rrdtool;
global.child_p = child_p;
global.cfg     = cfg;
if(cfg.KEY){
  var sshUtils = require('ssh2-utils');

  global.ssh = new sshUtils();
  global.sshServer = {
    host:       "counter",
    username:   "pi",
    privateKey: require('fs').readFileSync(cfg.KEY)    
  };
}
// .........................................................
var app = express();
// .........................................................
//var logRoute     = require('./routes/log')(SALT, ROLE, UNI);
// ---------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
// ---------------------------------------------------------
app.use(favicon(relPath('public/favicon.ico')));
app.use(compression({filter: compress}));
app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ---------------------------------------------------------
app.use("/public",   express.static(relPath('public')));
app.use("/lib",      express.static(relPath('public/lib')));
app.use("/css",      express.static(relPath('public/css')));
// .........................................................
app.all(/.*/, async (req, res, next) => {
  next();
});
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.render('index', {
    extend: extend,
    req: req,
    res: res
  });
});
// rest ....................................................
app.post('/', (req, res) => {
  res.render('index', {
    extend: extend,
    cfg: cfg,
    req: req,
    res: res
  }, function(err, html){
  });
});
// ---------------------------------------------------------
//app.use('/log',     logRoute);
// .........................................................
app.get('/js/:script.js', (req, res, next) => {
  if(req.session.logged)
    res.render("js/"+req.params.script+".ejs", {
      req: req,
      res: res
    });
  else
    next();
});
// .........................................................
app.use(function(req, res, next) {
  console.log(req.url);  
  var err = new Error('Not Found');

  err.cfg = res.cfg;
  err.status = 404;
  next(err);
});
// ---------------------------------------------------------
app.use(function(err, req, res, next) {
  if(err)
    console.log(err);  
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ?
                       err : {};
  res.locals.app     = res.app;
  res.status(err.status || 500);
  res.locals.sprintf = sprintf;
  res.render('error');
});
// ---------------------------------------------------------
http.createServer(app).listen({port: cfg.port}, () => {
  console.log(sprintf('%-9s listening on port %d (HTTP)',
    path.basename(__filename),
    cfg.port));
});
// ---------------------------------------------------------
function relPath(relPath){
  return path.join(__dirname, relPath);
}
// ---------------------------------------------------------
function compress(req, res) {
  if(req.headers['x-no-compression'])
    return false
  return compression.filter(req, res)
}
// ---------------------------------------------------------
