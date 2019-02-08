'user strict';

const { series, parallel, src, dest, watch }  = require('gulp')
const insert = require('gulp-insert');
const sass = require('gulp-sass');

const browsersync = require("browser-sync").create();

const express = require('express');
const http = require('http'); 


const PORT = (process.env.PORT || 3000);
// colors sourced from here - https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const col = {
  FgBlack : "\x1b[30m",
  FgRed : "\x1b[31m",
  FgGreen : "\x1b[32m",
  FgYellow : "\x1b[33m",
  FgBlue : "\x1b[34m",
  FgMagenta : "\x1b[35m",
  FgCyan : "\x1b[36m",
  FgWhite : "\x1b[37m",
}


// Build functions

function build_images(cb){
  return src('src/img/**/*.svg')
  .pipe( dest('dist/img') )
}

function build_styles(cb){
  return src('./src/scss/**/*.scss')
  .pipe( sass().on('error', sass.logError) )
  .pipe( dest('./dist/styles') )
}

function build_markup(cb){
  return src('./src/html/**/*.html')
  .pipe( dest('./dist/') )
}

function build_scripts(cb){
  return src('./src/scripts/**/*.js')
  .pipe( dest('./dist/scripts') )
}

function build_data(cb){
  return src('./src/data/**/*.json')
  .pipe( dest('dist/data') )
}

function build_sw(cb){
  return src('./src/sw.js')
  .pipe( insert.prepend(`//${new Date().toString()} \n`) )
  .pipe( dest('dist') )
}

function get_IDBScript(cb){
  return src('./node_modules/idb/build/idb.js')
  .pipe( dest('./dist/scripts') )
}

function mjsScripts(cb){
  return src('./src/scripts/**/*.js')
  .pipe( dest('./dist/scripts') )
}
//utility functions

// browser sync used from here - https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a
function browserSync(cb){
  browsersync.init({
    server: {
      baseDir: "./dist"
    },
    port:3000
  });
  cb()
}

function browserSyncReload(cb){
  browsersync.reload();
  cb()
}

devReload = series(build_sw, browserSyncReload)

function watchFiles(){
  watch("./src/html/**/*", series(build_markup, devReload))
  watch("./src/scss/**/*", series(build_styles, devReload))
  watch("./src/scripts/**/*", series(build_scripts, devReload))
  watch("./src/data/**/*", series(build_data, devReload))
  watch("./src/img/**/*", series(build_images, devReload))
  watch("./src/sw.js", devReload)
}



function serve_prod(cb){
  var app = express();
  var server;
  
  app.set('port', PORT);
  app.use(express.static('./dist'))
  server = http.createServer(app);
  server.listen(app.get('port'), ()=>(console.log(app.get('port'))))
  cb()
}


// compiled functions

build_files = parallel(  build_markup, build_styles, build_scripts, build_sw, get_IDBScript, build_images, build_data );
serve_dev = parallel( watchFiles, browserSync )


exports.build = build_files;
exports.build_images = build_images;
exports.serve_dev = serve_dev;
exports.serve_prod = serve_prod;

exports.default = series( build_files, serve_dev)