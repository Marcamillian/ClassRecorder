'use strict';

const PORT = (process.env.PORT || 3000)

var gulp = require('gulp');
var sass = require('gulp-sass');
var serve = require('gulp-serve');

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

gulp.task('serve-prod', serve({
  root:['./dist'],
  port: PORT,
}));

gulp.task('default', ['build','serve','watch'])