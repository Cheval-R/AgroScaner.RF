'use strict';

import gulp from 'gulp';
import gulpif from 'gulp-if';
import browserSync from 'browser-sync';
import rename from 'gulp-rename';
import { deleteSync } from 'del';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';

// HTML
import htmlmin from 'gulp-htmlmin';

// CSS
import sass from 'sass';
import gulpSass from 'gulp-sass';
const compSass = gulpSass(sass); // Dart Sass API
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import gcmq from 'gulp-group-css-media-queries';

// JS
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import terser from 'gulp-terser';

// Images
import gulpImg from 'gulp-image';
import gulpWebp from 'gulp-webp';
import gulpAvif from 'gulp-avif';
import svgSprite from 'gulp-svg-sprite';

let dev = false;

const path = {
  docs: {
    base: 'docs/',
    html: 'docs/',
    js: 'docs/js/',
    css: 'docs/css/',
    cssIndex: 'docs/css/style.min.css',
    img: 'docs/img/',
  },
  src: {
    html: 'src/*.html',
    scss: {
      'intro': './src/scss/blocks/intro-styles.scss',
      'corn': './src/scss/blocks/corn-harvesting.scss',
      'calculator': './src/scss/blocks/calculator.scss',
    },
    js: {
      corn: [
        './src/js/corn/main.js',
        './src/js/corn/map.js',
        './src/js/corn/datepicker.js',
        './src/js/corn/weather.js',
        './src/js/corn/validate.js',
        './src/js/corn/forecast.js',
        './src/js/corn/graph.js',
      ],
      calculator: [
        './src/js/calculator/data.js',
        './src/js/calculator/templates.js',
        './src/js/calculator/calculator.js',
      ]
    },
    img: 'src/img/**/*.*',
    svg: 'src/svg/**/*.svg',
    imgF: 'src/img/**/*.{jpg,jpeg,png}',
    assets: [
      'src/fonts/**/*.*',
      'src/icons/**/*.*',
      'src/video/**/*.*',
      'src/public/**/*.*',
    ],
  },
  watch: {
    html: 'src/*.html',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.*',
    svg: 'src/svg/**/*.svg',
  }
};

// ===== Helper =====
const plumberNotify = (title) => ({
  errorHandler: notify.onError({ title, message: 'Error <%= error.message %>', sound: false })
});

// ===== HTML =====
export const html = () =>
  gulp.src(path.src.html)
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(gulpif(!dev, htmlmin({ collapseWhitespace: true, removeComments: true })))
    .pipe(gulp.dest(path.docs.html))
    .pipe(browserSync.stream());

// ===== CSS =====
export const scss = () => {
  const tasks = Object.entries(path.src.scss).map(([name, file]) =>
    gulp.src(file)
      .pipe(plumber(plumberNotify(`SCSS: ${name}`)))
      .pipe(gulpif(dev, sourcemaps.init()))
      .pipe(compSass({ style: !dev ? 'compressed' : 'expanded' }).on('error', compSass.logError))
      .pipe(gulpif(!dev, autoprefixer({ cascade: false, grid: false })))
      .pipe(gulpif(!dev, gcmq()))
      .pipe(gulpif(!dev, cleanCSS({ level: 2, format: 'keep-breaks' })))
      .pipe(rename({ basename: name, suffix: '.min' }))
      .pipe(gulpif(dev, sourcemaps.write()))
      .pipe(gulp.dest(path.docs.css))
      .pipe(browserSync.stream())
  );
  return Promise.all(tasks);
};

// ===== JS =====
export const js = () => {
  const tasks = Object.entries(path.src.js).map(([name, files]) =>
    gulp.src(files)
      .pipe(plumber(plumberNotify(`JS: ${name}`)))
      .pipe(webpackStream({
        mode: dev ? 'development' : 'production',
        devtool: dev ? 'eval-source-map' : false,
        output: { filename: `${name}.js` },
        module: { rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }] }
      }, webpack))
      .pipe(gulpif(!dev, terser()))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(path.docs.js))
      .pipe(browserSync.stream())
  );
  return Promise.all(tasks);
};

// ===== Images =====
export const img = () =>
  gulp.src(path.src.img)
    .pipe(gulpif(!dev, gulpImg()))
    .pipe(gulp.dest(path.docs.img))
    .pipe(browserSync.stream({ once: true }));

export const webp = () =>
  gulp.src(path.src.imgF)
    .pipe(gulpWebp({ quality: dev ? 100 : 60 }))
    .pipe(gulp.dest(path.docs.img))
    .pipe(browserSync.stream({ once: true }));

export const avif = () =>
  gulp.src(path.src.imgF)
    .pipe(gulpAvif({ quality: dev ? 100 : 50 }))
    .pipe(gulp.dest(path.docs.img))
    .pipe(browserSync.stream({ once: true }));

export const svg = () =>
  gulp.src(path.src.svg)
    .pipe(svgSprite({ mode: { stack: { sprite: '../sprite.svg' } } }))
    .pipe(gulp.dest(path.docs.img))
    .pipe(browserSync.stream({ once: true }));

// ===== Assets copy =====
export const copy = () =>
  gulp.src(path.src.assets, { base: 'src/' })
    .pipe(gulp.dest(path.docs.base))
    .pipe(browserSync.stream({ once: true }));

// ===== Clean =====
export const clear = (done) => {
  deleteSync([path.docs.base], { force: true });
  done();
};

// ===== Server =====
export const server = () => {
  browserSync.init({
    server: { baseDir: path.docs.base },
    port: 3000,
    notify: false,
    ui: false
  });

  gulp.watch(path.watch.html, html);
  gulp.watch(path.watch.scss, scss);
  gulp.watch(path.watch.js, js);
  gulp.watch(path.watch.img, img);
  gulp.watch(path.watch.svg, svg);
};

// ===== Tasks =====
const develop = (done) => { dev = true; done(); };
export const base = gulp.parallel(html, scss, js, img, svg, webp, avif, copy);
export const build = gulp.series(clear, base);
export default gulp.series(develop, base, server);
