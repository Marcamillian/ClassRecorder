'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var serve = require('gulp-serve');



gulp.task('styles', ()=>{
  return gulp.src('./src/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./dist/styles'))
})

gulp.task('scripts', ()=>{
  return gulp.src('./src/js/**/*.js')
  .pipe(gulp.dest('./dist/scripts'))
})

gulp.task('markup', ()=>{
  return gulp.src('./src/html/**/*.html')
  .pipe(gulp.dest('./dist/'))
})

gulp.task('build',['styles', 'scripts', 'markup'])

gulp.task('watch', ()=>{
  gulp.watch('./src', ['styles', 'scripts', 'markup'])
})

gulp.task('serve', serve('dist'));

gulp.task('default', ['build','serve','watch'])