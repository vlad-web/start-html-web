(function() {
	'use strict'

var gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	sourceMap 	 	= require('gulp-sourcemaps'),
	notify 		 	= require("gulp-notify"),
	gcmq 		 	= require('gulp-group-css-media-queries'),
	cleanCSS     	= require('gulp-clean-css'),
	rigger       	= require('gulp-rigger'),
	gutil           = require('gulp-util'),
	watch 			= require('gulp-watch'),
	reload 			= browserSync.reload,
	autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
	
	var path = {
        build: { //Тут мы укажем куда складывать готовые после сборки файлы
        	html: 'build/',
        	js: 'build/js/',
        	css: 'build/css/',
        	img: 'build/img/',
        	fonts: 'build/fonts/',
        	libs: 'build/libs/'
        },
        load: { //Тут мы укажем куда складывать готовые после сборки файлы
        	html: 'app/',
        	js: 'app/js/',
        	css: 'app/css/',
        	img: 'app/img/',
        	fonts: 'app/fonts/',
        	libs: 'app/libs/'
        },
        src: { //Пути откуда брать исходники
            html: 'app/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
            js: 'app/js/common.js',//В стилях и скриптах нам понадобятся только main файлы
            style: 'app/sass/style.sass',
            img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
            fonts: 'app/fonts/**/*.*',
            libs: 'app/libs/**/*.*'
          },
        watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        	html: 'app/**/*.html',
        	js: 'app/js/**/*.js',
        	style: 'app/sass/**/*.sass',
        	img: 'app/img/**/*.*',
        	fonts: 'app/fonts/**/*.*'
        },
        clean: './build'
      };


      var config = {
      	server: {
      		baseDir: "./app"
      	},
		//tunnel: true,
		host: 'localhost',
		notify: false, // Отключаем уведомления
		port: 3000,
		logPrefix: "Frontend"
	};
	
	gulp.task('webserver',async function () {
		browserSync(config);
	});



	gulp.task('html:build', async  function () {
        gulp.src(path.src.html) //Выберем файлы по нужному пути
        /*.pipe(plumber())*/
            .pipe(rigger().on('error', gutil.log)) //Прогоним через rigger
            .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
            //.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
          });

	gulp.task('js:build', async function () {
        gulp.src(path.src.js) //Найдем наш main файл
            .pipe(rigger()) //Прогоним через rigger*!/
            //.pipe(sourceMap.init()) //Инициализируем sourcemap
            //.pipe(uglify()) //Сожмем наш js
            //.pipe(sourceMap.write()) //Пропишем карты
            //.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
            .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
            //.pipe(reload({stream: true})); //И перезагрузим сервер
          });


	gulp.task('style:build', async function () {
        gulp.src(path.src.style) //Выберем наш main.scss
            .pipe(sourceMap.init()) //То же самое что и с js
            .pipe(sass({
            	outputStyle: 'compact'
            })) //Скомпилируем
            .on('error', notify.onError({
            	title: 'Error compiling Sass',
            	message: 'Check the console for info'
            }))
            .on('error', sass.logError)
            .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) //Добавим вендорные префиксы
            .pipe(gcmq())
            .pipe(cleanCSS({format: 'keep-breaks'})) //Сожмем  beautify - обынчый вид | keep-breaks - в одну строку с разрывом 
            .pipe(sourceMap.write('./'))
            .pipe(gulp.dest(path.build.css)) //И в build
            //.pipe(reload({stream: true}));
          });



	gulp.task('image:build', async function () {
        gulp.src(path.src.img) //Выберем наши картинки
            .pipe(imagemin({ //Сожмем их
            	progressive: true,
            	svgoPlugins: [{removeViewBox: false}],
            	use: [pngquant()],
            	interlaced: true
            }))
            .pipe(gulp.dest(path.build.img)) //И бросим в build
            //.pipe(reload({stream: true}));
          });

	gulp.task('fonts:build', async function() {
		gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
	});

	gulp.task('libs:build', async function() {
		gulp.src(path.src.libs)
		.pipe(gulp.dest(path.build.libs))
	});



	gulp.task('build', gulp.parallel(
		'html:build',
		'js:build',
		'style:build',
		'fonts:build',
		'image:build',
		'libs:build'
		));

	gulp.task('html:load', function() {
		return gulp.src('app/*.html')
		.pipe(reload({ stream: true }));
	});

gulp.task('css:load', function() { // Создаем таск Sass
	return gulp.src('app/sass/**/*.sass') // Берем источник
	.pipe(sass({
                outputStyle: 'expanded' // :nested :compact :expanded :compressed
            })) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(reload({stream: true})) // Обновляем CSS на странице при изменении
	});
gulp.task('js:load', function() {
	return gulp.src('app/js/*.js') // Берем источник
	.pipe(reload({ stream: true }));
});

gulp.task('watch', function() {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('css:load')); // Наблюдение за sass файлами
	gulp.watch('app/*.html', gulp.parallel('html:load')); // Наблюдение за HTML файлами в корне проекта
	gulp.watch(['app/js/*.js'], gulp.parallel('js:load')); // Наблюдение за главным JS файлом и за библиотеками

});

gulp.task('default', gulp.parallel('webserver', 'watch'));

})();