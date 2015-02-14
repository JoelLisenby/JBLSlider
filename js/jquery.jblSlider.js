/* JBL Slider by Joel Lisenby 
Responsive. Fixed height option.
*/
(function ( $ ) {
$.fn.jblSlider = function( options ) {
	this.animating = false;
	this.animationFrame = null;
	this.defaults = {
		element: '.jblslider',
		height: 300,
		duration: 500,
		delay: 5000
	};
	this.options = $.extend({}, this.defaults, options);
	this.slider = $(this.options.element);
	this.slides = {};
	this.slidesInterval = null;
	this.current = 0;
	this.next = 0;
	this.timeElapsed = 0;
	this.timeStart = 0;
	
	var jbl = this;
	
	this.init = function(element) {
		jbl.options.element = element;
		
		jbl.prepSlides($(jbl.options.element).children()).done(function() {
			jbl.play();
			jbl.nav();
			
			jbl.slides[jbl.current].pos = {x: -Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0}
			jbl.slides[jbl.next].pos = {x: -Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
			
			$(window).resize(function() {
				jbl.slides[jbl.current].pos = {x: -Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0};
				jbl.slides[jbl.next].pos = {x: -Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
				
				if(!jbl.animating) {
					$(jbl.slides[jbl.current].element).css({'background-position': jbl.slides[jbl.current].pos.x +'px '+' '+ jbl.slides[jbl.current].pos.y +'px'});
					$(jbl.slides[jbl.next].element).css({'background-position': jbl.slides[jbl.next].pos.x  +'px '+' '+ jbl.slides[jbl.next].pos.y +'0px'});
				}
			});
		});
	};
	
	this.nav = function() {
		$(jbl.options.element).append('<a href="#" class="nav-prev"></a><a href="#" class="nav-next"></a>');
		$('.nav-prev').click(function(e) {
			var cnt = Object.keys(jbl.slides).length;
			var slide = (cnt == 0 ? 0 : (jbl.current > 0 ? jbl.current - 1 : cnt - 1) );
			jbl.pause();
			jbl.nextSlide(slide);
			(e.preventDefault) ? e.preventDefault() : e.returnValue = false;
		});
		$('.nav-next').click(function(e) {
			jbl.pause();
			jbl.nextSlide();
			(e.preventDefault) ? e.preventDefault() : e.returnValue = false;
		});
	}

	this.prepSlides = function(slides) {
		var loaded = 0;
		var postaction = function(){};
		
		$(jbl.options.element).css('height',jbl.options.height);
		
		// prep slide and increment
		function incImg() {
			loaded++;
			if(loaded == slides.length) {
				for(var i = 0; i < slides.length; i++) {
					jbl.slides[i] = {
						element: slides[i],
						width: img.width,
						height: img.height
					};
					var sposx = -Math.round((img.width - $(slide).width()) / 2);
					$(jbl.slides[i].element).css({
						'max-width': img.width,
						'height': jbl.options.height,
						'background-position': sposx +'px '+' 0px'
					});
				}
				
				postaction();
			}
		}
		
		// load images
		for(var i = 0; i < slides.length; i++) {
			var slide = slides[i];
			var img = new Image;
			img.src = $(slide).css('background-image').replace(/"/g,'').slice(4, -1);
			img.onload = function() {
				incImg();
			};
		};
		
		return {
			done: function(f) {
				postaction = f || postaction
			}
		};
	};
	
	this.play = function() {
		jbl.slidesInterval = setInterval(function() {
			jbl.nextSlide();
		}, jbl.options.delay);
	};
	
	this.pause = function() {
		clearInterval(jbl.slidesInterval);
	}
	
	this.nextSlide = function(next) {
		var cnt = Object.keys(jbl.slides).length;
		if(next === undefined) {
			jbl.next = (cnt > 1 ? (jbl.current < cnt - 1 ? jbl.current + 1 : 0) : jbl.current);
		} else {
			jbl.next = next;
		}
		
		if(!jbl.animating) {
			jbl.animate();
		}
	};
	
	this.animate = function() {
		jbl.timeElapsed = 0.0;
		
		jbl.slides[jbl.current].pos = {x: -Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0}
		jbl.slides[jbl.next].pos = {x: -Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
		
		var interval = setInterval(function() {
			if(jbl.timeStart == 0) {
				jbl.timeStart = new Date().getTime();
			}
			jbl.animating = true;
			var t = new Date().getTime();
			
			jbl.paused = false;
			jbl.timeElapsed = t - jbl.timeStart;
			
			var percent = jbl.timeElapsed / jbl.options.duration;
			percent = percent > 1.0 ? 1.0 : percent;
			
			jbl.slides[jbl.current].pos = {x: Math.round(jbl.slides[jbl.current].width * percent) - Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0};
			jbl.slides[jbl.next].pos = {x: -jbl.slides[jbl.next].width + Math.round(jbl.slides[jbl.next].width * percent) - Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
			
			$(jbl.slides[jbl.current].element).children('span').hide();
			$(jbl.slides[jbl.next].element).show();
			$(jbl.slides[jbl.next].element).children('span').show();
			$(jbl.slides[jbl.current].element).css({
				'background-position': jbl.slides[jbl.current].pos.x+'px'+' '+ jbl.slides[jbl.current].pos.y +'px',
				'z-index': 2
			});
			$(jbl.slides[jbl.next].element).css({
				'background-position': jbl.slides[jbl.next].pos.x+'px'+' '+ jbl.slides[jbl.current].pos.y +'px',
				'z-index': 3
			});
			
			if(percent >= 1) {
				$(jbl.slides[jbl.current].element).hide();
				clearInterval(interval);
				jbl.timeStart = 0;
				jbl.timeElapsed = 0;
				jbl.current = jbl.next;
				jbl.animating = false;
			}
		}, 1000 / 60);
	};
	
	return this.each(function() {
		jbl.init(this);
	});
};
}( jQuery ));