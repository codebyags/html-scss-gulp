const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const message = require('gulp-message');
const del = require('gulp-clean');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const path = require("path");
const webp = require('gulp-webp');
const pug = require('gulp-pug');
const gulpHtmlBemValidator = require('gulp-html-bem-validator');
const imagemin = require("gulp-imagemin");
const cssminify = require("gulp-css-minify");
const rename = require("gulp-rename");
const resizer = require('gulp-images-resizer');
const imgRetina = require('gulp-img-retina'); // ДОРАБОТАТЬ ! reImageSrc в index.js, убрать svg

var retinaOpts = {
	suffix: {
		'2': 'x2',
		'1': '',
	}
};

function browsersync(cb) {
	browserSync.init({
		port: 3031,
		server: {
			baseDir: './build/',
			index: "index.html",
		},
		ghostMode: {
			clicks: true,
			forms: true,
			scroll: true
		}
	});
	cb();
}

function clean(cb) {
	message.info('Очистка build/');
	del('.build/**', {force:true})
	cb();
}

function contentImagesWebp(cb) {
	src([
		'./src/img/content/**/*.jpg',
		'./src/img/content/**/*.png'
	])
		.pipe(webp())
		.pipe(dest('./build/img/content/webp/'))
		.pipe(browserSync.stream());

	cb();
}

function scripts(cb) {
	src([
		//'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'./node_modules/vanilla-lazyload/dist/lazyload.js',
		'./node_modules/swiper/swiper-bundle.js',
		'./node_modules/imask/dist/imask.js',
		'./src/js/usr/**/*.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
	])
		.pipe(concat('bundle.js')) // Конкатенируем в один файл
		.pipe(sourcemaps.init()) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(sourcemaps.write('./'))
		.pipe(dest('./build/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
	cb();
}

function scss(cb) {
	src('./src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('/style.css'))
		//.pipe(cssminify())
		.pipe(sourcemaps.write('./'))
		.pipe(dest('./build/css/'))
		.pipe(browserSync.stream());
	cb();
}

function pugTemplates(cb) {

	try {
		src('./src/pug/*.pug')
			.pipe(pug())
			.on('error', function(e) {
				console.log(e.message);
			})
			.pipe(gulpHtmlBemValidator())
			.pipe(imgRetina(retinaOpts))
			.pipe(dest('./build/'))
			.pipe(browserSync.stream());
	} catch (e) {
		console.error(e)
	}

	cb();
}

function createProject(cb) {
	// Создаёт проект при первой загрузке
	const folders = [
		'scss', // Папки для scss
		'img/content', // Изображения для контента
		'img/icons', // Изображения иконок, собирается в спрайт
		'fonts', // Шрифты
		'js/usr', // Писанина на JS
		'js/libs',// Js библиотеки
		'pug/common', // Для шаблонов (footer header layout)
		'uploads' // контент для загрузок
	];
	folders.forEach(dir => {
		dir = "./src/" + dir;
		if(!fs.existsSync(dir)) {
			fs.mkdirSync(dir, {
				recursive: true
			});
			message.info('📁  folder created:' + dir);
		}
	});

	// Начальные файлы проекта для теста
	const files = [
		{f:'./pug/index.pug', c:'h1 Проект готов к работе !'},
		{f:'./js/usr/app.js', c:'console.log("JS готов к работе !")'},
		{f:'./scss/style.scss', c:'@import "node_modules/reset-css/sass/reset";body{color:red}'}
	];
	files.forEach(file => {
		let file_path = "./src/" + file.f;
		if(!fs.existsSync(file_path)) {
			fs.writeFile(file_path, file.c, function (err) {

				if (err) {
					console.log(err);
				} else {
					console.log("📝 Файл создан: " + file.f);
				}

			});
		}
	});

	cb();
}

// Рекурсия обработки файлов
const getAllFiles = function(dirPath, arrayOfFiles) {
	files = fs.readdirSync(dirPath)
	arrayOfFiles = arrayOfFiles || []
	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
		} else {
			arrayOfFiles.push([dirPath, file])
		}
	})
	return arrayOfFiles
}

function imageMin(cb) {
	let path_files = './src/img/content';
	getAllFiles(path_files).forEach(function (file) {
		let dest_path = './build/img/content' + file[0].replace(path_files,'');
		console.log("📝 Работа с файлом: " + file[0] + "/" + file[1] + " Размещение в: " + dest_path);

		src(file[0] + "/" + file[1])
			.pipe(rename(function (path) {
				path.basename += "x2";
				console.log(path.basename)
			}))
			//.pipe(imagemin())
			.pipe(dest(dest_path))

			.pipe(rename(function (path) {
				path.basename = path.basename.replace("x2", '');
				console.log(path.basename)
			}))
			.pipe(resizer({
				verbose: true,
				width: "50%"
			}))
			.pipe(imagemin())
			.pipe(dest(dest_path));
	});


	src('./src/img/icons/**/*')
		.pipe(dest('./build/img/icons'))
		.pipe(browserSync.stream());
	cb();
}

function uploads(cb) {

	src('./src/uploads/*')
		.pipe(dest('./build/uploads/'))
		.pipe(browserSync.stream());

	cb();
}

function watchImageMin(cb) {
	watch('./src/img/**/*', imageMin);
	cb();
}

function fonts(cb) {
	src('./src/fonts/**/*')
		.pipe(dest('./build/fonts/'))
	cb();
}

function watchFonts(cb) {
	watch('./src/fonts/**/*', fonts);
	cb();
}

function watchSCSS(cb) {
	watch('./src/scss/**/*.scss', scss);
	cb();
}

function watchJS(cb) {
	watch('./src/js/**/*.js', scripts);
	cb();
}

function watchPugTemplates(cb) {
	watch('./src/pug/**/*.pug', pugTemplates);
	cb();
}

exports.default = series(clean, createProject, fonts, pugTemplates, scss, scripts, uploads, browsersync, watchFonts, watchSCSS, watchJS, watchPugTemplates);
exports.optiimg = series(imageMin);
exports.uploads = series(uploads);
