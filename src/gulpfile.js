'use strict';

var fs = require('fs');
var gulp = require('gulp');
var clean = require('gulp-clean');
var compass = require('gulp-compass');
var path = require('path');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var rsync = require('rsyncwrapper').rsync;
var ftp = require('gulp-ftp');
var gulpconfig = require('./gulpconfig');
var pkg = require('./package.json');


require('colors');

/*ISSO VAI DEIXAR*/
gulp.task('jshint', function() {
    var stream = gulp.src([gulpconfig.dirs.js + '/main.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish));

    return stream;
});

/*ISSO VAI DEIXAR*/
gulp.task('uglify', ['jshint'], function() {
    var stream = gulp.src([
            gulpconfig.dirs.js + '/libs/*.js', // External libs/plugins
            gulpconfig.dirs.js + '/main.js' // Custom JavaScript
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(gulpconfig.dirs.js));

    return stream;
});

/*ISSO VAI DEIXAR*/
gulp.task('uglify-bootstrap', ['clean-bootstrap'], function() {
    gulp.src([
            gulpconfig.dirs.js + '/bootstrap/transition.js',
            gulpconfig.dirs.js + '/bootstrap/alert.js',
            gulpconfig.dirs.js + '/bootstrap/button.js',
            gulpconfig.dirs.js + '/bootstrap/carousel.js',
            gulpconfig.dirs.js + '/bootstrap/collapse.js',
            gulpconfig.dirs.js + '/bootstrap/dropdown.js',
            gulpconfig.dirs.js + '/bootstrap/modal.js',
            gulpconfig.dirs.js + '/bootstrap/tooltip.js',
            gulpconfig.dirs.js + '/bootstrap/popover.js',
            gulpconfig.dirs.js + '/bootstrap/scrollspy.js',
            gulpconfig.dirs.js + '/bootstrap/tab.js',
            gulpconfig.dirs.js + '/bootstrap/affix.js'
        ])
        .pipe(uglify())
        .pipe(gulp.dest(gulpconfig.dirs.js + '/libs/bootstrap.min.js'));
});

/*ISSO VAI DEIXAR*/
gulp.task('compass', function() {
    return gulp.src(gulpconfig.dirs.sass + '/**/*.scss')
        .pipe(compass({
            project: path.join(__dirname, '../assets'),
            css: 'css',
            sass: 'sass'
        }))
        .pipe(browserSync.reload({ stream: true }));
});

// Reload all Browsers
gulp.task('bs-reload', function() {
    browserSync.reload();
});

// Start the server
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "partinersgold.dev"
    });
});

gulp.task('watch', ['browser-sync'], function() {
    var watchers = [
        gulp.watch(gulpconfig.dirs.sass + '/**/*', ['compass']),
        //gulp.watch(gulpconfig.dirs.js + '/**/*.js', ['uglify'])
    ];

    watchers.forEach(function(watcher) {
        watcher.on('change', function(e) {
            // Get just filename
            var filename = e.path.split('/').pop();
            var bars = '\n================================================';

            console.log((bars + '\nFile ' + filename + ' was ' + e.type + ', runing tasks...' + bars).toUpperCase());
        });
    });

});

/*ISSO VAI DEIXAR*/
gulp.task('imagemin', function() {
    gulp.src(gulpconfig.dirs.images + '/**/*.{jpg, png, gif}')
        .pipe(
            imagemin({
                optimizationLevel: 7,
                progressive: true
            })
        )
        .pipe(gulp.dest(gulpconfig.dirs.images));
});


/*ISSO VAI DEIXAR - (não sei usar, mas é deploy) */
gulp.task('rsync-staging', function() {
    var rsyncConfig = gulpconfig.rsyncConfig;
    rsyncConfig.options.src = rsyncConfig.staging.src;
    rsyncConfig.options.dest = rsyncConfig.staging.dest;

    return rsync(
        rsyncConfig.options,
        function(err, stdout, stderr, cmd) {
            console.log('Shell command was:', cmd.cyan);

            if (err) {
                return console.log(err.message.red);
            }

            console.log('Success!', stdout.grey);
        }
    );
});


/*ISSO VAI DEIXAR - (não sei usar, mas é deploy de produção) */
gulp.task('rsync-production', function() {
    var rsyncConfig = gulpconfig.rsyncConfig;
    rsyncConfig.options.src = rsyncConfig.production.src;
    rsyncConfig.options.dest = rsyncConfig.production.dest;

    return rsync(
        rsyncConfig.options,
        function(err, stdout, stderr, cmd) {
            console.log('Shell command was:', cmd.cyan);

            if (err) {
                return console.log(err.message.red);
            }

            console.log('Success!', stdout.grey);
        }
    );
});


/*ISSO VAI DEIXAR - (deploy) */
gulp.task('ftp-deploy', function() {
    var ftpConfig = gulpconfig.ftpConfig;

    gulp.src(gulpconfig.dirs.deploy)
        .pipe(
            ftp({
                host: ftpConfig.host,
                user: ftpConfig.user,
                pass: ftpConfig.password
            })
        );
});


/* ISSO VAI DEIXAR */
gulp.task('zip', function() {
    var dirs = gulpconfig.dirs;

    gulp.src([
            '../**/*',
            '!../src/**/*',
            '!../**/*.md',
            '!' + dirs.sass + '/**/*',
            '!' + dirs.js + '/bootstrap/**/*',
            '!' + dirs.js + '/libs/**/*',
            '!' + dirs.js + '/main.js',
            '!../**/*.zip'
        ])
        .pipe(zip(pkg.name + '.zip'))
        .pipe(gulp.dest(gulpconfig.dirs.deploy));
});


/* ISSO VAI DEIXAR - (deploy) */
gulp.task('clean', function() {
    var dirs = gulpconfig.dirs;

    gulp.src([
            dirs.tmp + '/*',
            dirs.sass + '/bootstrap',
            dirs.js + '/bootstrap',
            dirs.js + '/libs/bootstrap.min.js',
            dirs.fonts + '/bootstrap'
        ], { read: false })
        .pipe(clean({ force: true }));
});


/* ISSO VAI DEIXAR - (pega o bootstrap em sass) */
gulp.task('get-bootstrap', ['clean'], function() {
    var url = 'https://github.com/twbs/bootstrap-sass/archive/master.zip';
    return require('gulp-download')(url)
        .pipe(gulp.dest(gulpconfig.dirs.tmp));
});


/* ISSO VAI DEIXAR -  */
gulp.task('unzip', ['get-bootstrap'], function(cb) {
    var exec = require('child_process').exec;
    exec('cd tmp/ && unzip master.zip && cd ..', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});


/* ISSO VAI DEIXAR - (deploy) */
gulp.task('rename', ['unzip'], function() {
    gulp.src(gulpconfig.dirs.tmp + '/bootstrap-sass-master/assets/stylesheets/bootstrap/**/*')
        .pipe(gulp.dest(gulpconfig.dirs.sass + '/bootstrap'));

    gulp.src(gulpconfig.dirs.tmp + '/bootstrap-sass-master/assets/javascripts/bootstrap/**/*')
        .pipe(gulp.dest(gulpconfig.dirs.js + '/bootstrap'));

    gulp.src(gulpconfig.dirs.tmp + '/bootstrap-sass-master/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest(gulpconfig.dirs.fonts + '/bootstrap'));
});


/*ISSO VAI DEIXAR - (deploy) */
gulp.task('clean-bootstrap', ['rename'], function() {
    var dirs = gulpconfig.dirs;

    gulp.src([
            dirs.tmp + '/*',
            dirs.sass + '/bootstrap/bootstrap.scss'
        ], { read: false })
        .pipe(clean({ force: true }));
});







/**
 * Execution Tasks
 */
gulp.task('default', ['jshint', 'compass', 'uglify']);
gulp.task('optimize', ['imagemin']);
gulp.task('ftp', ['ftp-deploy']);
gulp.task('compress', ['default', 'zip']);
gulp.task('bootstrap', ['uglify-bootstrap'], function() {
    gulp.start('compass');
});



/**
 * Short aliases
 */
gulp.task('w', ['watch']);
gulp.task('o', ['optimize']);
gulp.task('f', ['ftp']);
gulp.task('rs', ['rsync-stage']);
gulp.task('rp', ['rsync-production']);
gulp.task('r', ['rsync-staging', 'rsync-production']);
gulp.task('c', ['compress']);
