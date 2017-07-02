var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
		browserSync  = require('browser-sync').create();
   
   
gulp.task('browser-sync', function() {
		browserSync.init({
				server: {
						baseDir: "./app"
				},
				notify: false
		});
});

gulp.task('sass', function () {
  return gulp.src('app/sass/*.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/css'));
});


/* смотрители */
gulp.task('bsync:watch', ['browser-sync'], function () {
	gulp.watch('app/sass/*.sass', ['sass']);
	gulp.watch('app/css/*.css').on("change", browserSync.reload);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('sass:watch', function () {
	gulp.watch('app/sass/*.sass', ['sass'] );
});
/* end смотрители */
 
 
gulp.task('default', function() {
  console.log("Приятной работы!");
});
