'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const serve = require('gulp-serve');
const express = require('express');
const http = require('http'); 

const PORT = (process.env.PORT || 3000)



gulp.task('imgs',()=>{
  gulp.src('src/img/**/*.svg')
  .pipe(gulp.dest('dist/img'))
})

gulp.task('styles', ()=>{
  return gulp.src('./src/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./dist/styles'))
})

gulp.task('scripts',['getIDBScript'], ()=>{
  return gulp.src('./src/scripts/**/*.js')
  .pipe(gulp.dest('./dist/scripts'))
})

gulp.task('markup', ()=>{
  return gulp.src('./src/html/**/*.html')
  .pipe(gulp.dest('./dist/'))
})

gulp.task('data',()=>{
  return gulp.src('./src/data/**/*.json')
  .pipe(gulp.dest('dist/data'))
})

gulp.task('getIDBScript',()=>{
  return gulp.src('./node_modules/idb/lib/idb.js')
  .pipe(gulp.dest('./dist/scripts'))
})

gulp.task('build',['styles', 'scripts', 'markup', 'imgs', 'data', 'getIDBScript'],()=>{
  console.log("Build complete");
})

gulp.task('watch', ()=>{
  gulp.watch(['./src/**/*.js', './src/**/*.html', './src/**/*.scss'], ['styles', 'scripts', 'markup'])
})

gulp.task('serve', serve('./dist'));

gulp.task('serve-prod', ['build'], ()=>{
  var app = express();
  app.set('port', PORT);
  app.use(express.static('./dist'))
  server = http.createServer(app);
  server.listen(app.get('port'), ()=>(console.log(app.get('port'))))
});

gulp.task('default', ['build','serve','watch'])