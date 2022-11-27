(function(m,e,t,r,i,k,a){m[i]=m[i] || function () {
	(m[i].a = m[i].a || []).push(arguments)
};
	m[i].l=1 * new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(89347257, "init", {
	clickmap:true,
	trackLinks:true,
	accurateTrackBounce:true,
	webvisor:true
});

document.addEventListener("DOMContentLoaded", function() {
	var sline = document.querySelector(".sline");
	var  slineMobileMenu = document.querySelector(".slineMobileMenu");

	// Мобильное меню открыть\закрыть
	function closeOpenMenu() {
		if(sline.classList.contains('sline__open')) {
			sline.classList.remove('sline__open');
			slineMobileMenu.classList.remove('slineMobileMenu__open');
		} else {
			sline.classList.add('sline__open');
			slineMobileMenu.classList.add('slineMobileMenu__open');
		}
	}
	document.querySelector('.slineHeader__OpenMobileBlock').addEventListener("click", function(){
		closeOpenMenu();
	});
	document.querySelector('.slineMobileMenu__CloseMobileMenu').addEventListener("click", function(){
		closeOpenMenu();
	});




	// Генерирум задние штуки и пралакс
	function createOvals() {
		var rect = document.querySelector('body').getBoundingClientRect()
		var w = rect.width;
		var h = rect.height;
		var count = h / w ;


		var backrgoundPrallax = document.querySelector('.backrgoundPrallax');
		if(backrgoundPrallax) {
			for (i = 0; i < count; i++) {
				prallaxDiv = document.createElement('div');
				prallaxDiv.classList.add('backrgoundPrallax__object');
				if(i % 2) {
					prallaxDiv.classList.add('backrgoundPrallax__object_c');
				}
				backrgoundPrallax.appendChild(prallaxDiv);
			}
		}

		document.addEventListener('scroll', function(e) {
			window.requestAnimationFrame(function () {
				backrgoundPrallax.style.top = document.body.scrollTop * -0.5 + "px";
			});

		})
	}

	createOvals();





	// Слайдер Block-2
	var swiper_1 = new Swiper('.js-Block2Slider', {
		speed: 400,
		slidesPerView: "auto",
		spaceBetween: 0,

		autoplay: {
			delay: 2500,
			disableOnInteraction: false,
		},

		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
	});

});