import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import fileinclude from 'gulp-file-include';
import newer from 'gulp-newer';
import plumber from 'gulp-plumber';
import bemhtml from 'gulp-bemhtml';
import imagemin from 'gulp-imagemin'; // Добавлено для обработки изображений
import { watch } from 'gulp';

const { src, dest, series, parallel } = gulp;
const sass = gulpSass(dartSass);

const paths = {
    html: {
        src: ['src/pages/**/*.html', 'src/blocks/**/*.html'],
        dest: 'dist/'
    },
    styles: {
        src: 'src/**/**/*.scss',
        main: 'src/styles/main.scss',
        dest: 'dist/styles/'
    },
    scripts: {
        src: 'src/blocks/**/*.js',
        main: 'src/scripts/main.js',
        dest: 'dist/scripts/'
    },
    images: {
        src: 'src/images/*',
        dest: 'dist/images/'
    }
};

// HTML
function html() {
    return src(paths.html.src)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        // .pipe(newer(paths.html.dest))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
}


// Styles
function styles() {
    return src(paths.styles.main)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

// Scripts
function scripts() {
    return src([paths.scripts.src, paths.scripts.main], { sourcemaps: true })
        .pipe(plumber())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

// Images
function images() {
    return src(paths.images.src, { encoding: false })
        .pipe(newer(paths.images.dest)) // Обрабатываем только новые или измененные изображения
        .pipe(imagemin()) // Минимизируем изображения
        .pipe(dest(paths.images.dest));
}

function icons() {
    return gulp.src('node_modules/social-icons-webfont/style.css', { encoding: false })
        .pipe(concat('social-icons.css'))
        // .pipe(cleanCSS())
        .pipe(dest(paths.styles.dest))
};

function fonts_icon(){
    return gulp.src('node_modules/social-icons-webfont/fonts/**/*', { encoding: false })
    .pipe(dest(paths.styles.dest + '/fonts'))
}


// Watch
function watchFiles() {
    watch(paths.styles.src, styles);
    watch(paths.scripts.src, scripts);
    watch(paths.html.src, html);
    watch(paths.images.src, images);
}



// BrowserSync
function browserSyncServe(cb) {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });
    cb();
}

function browserSyncReload(cb) {
    browserSync.reload();
    cb();
}

const build = series(parallel(html, styles, icons, fonts_icon,scripts, images));
const watchTask = parallel(watchFiles, browserSyncServe);

export { html, icons, fonts_icon, styles, scripts, watchTask as watch, build as default };

