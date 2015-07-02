/* JBL Slider by Joel Lisenby 
Responsive slider with partial cropping for safe area support.
*/

// requestAnimationFrame shim (https://gist.github.com/paulirish/1579671)
jQuery(document).ready(function($) {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
	};
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	};
}());

jQuery(document).ready(function($) {
$.fn.jblSlider = function( options ) {
	this.animating = false;
	this.animationFrame = null;
	this.options = {};
	this.slider = $(this.options.element);
	this.slides = {};
	this.slidesInterval = null;
	this.current = 0;
	this.next = 0;
	this.timeElapsed = 0;
	this.timeStart = 0;
	
	var jbl = this;
	
	this.init = function(element) {
		jbl.options = $.extend({
			element: element,
			animationType: 'fade',
			width: 1400,
			height: 400,
			safe_area: 640,
			duration: 1000,
			delay: 5000,
			resume: 20000
		}, options);
		
		jbl.bgWidth();
		
		jbl.prepSlides($(jbl.options.element).children()).done(function() {
			jbl.play();
			jbl.nav();
			
			jbl.slides[jbl.current].pos = {x: -Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0}
			jbl.slides[jbl.next].pos = {x: -Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
			
			$(window).resize(function() {
				jbl.bgWidth();
			});
		});
	};
	
	this.bgWidth = function() {
		var current_width = $('main').innerWidth();
		var p = current_width / jbl.options.safe_area;
		var nw = jbl.options.width;
		var nh = jbl.options.height;
		if(p <= 1) {
			nw = jbl.options.width * p;
			nh = jbl.options.height * p;
		}
		
		$(jbl).css('height', nh +'px');
		$('.slide').css('background-size', nw +'px');
	};
	
	this.nav = function() {
		$(jbl.options.element).append('<a href="#" class="nav-prev"></a><a href="#" class="nav-next"></a>');
		$('.nav-prev').click(function(e) {
			var cnt = Object.keys(jbl.slides).length;
			var slide = (cnt == 0 ? 0 : (jbl.current > 0 ? jbl.current - 1 : cnt - 1) );
			jbl.pause();
			setTimeout(jbl.play, jbl.options.resume);
			jbl.nextSlide(slide);
			(e.preventDefault) ? e.preventDefault() : e.returnValue = false;
		});
		$('.nav-next').click(function(e) {
			jbl.pause();
			setTimeout(jbl.play, jbl.options.resume);
			jbl.nextSlide();
			(e.preventDefault) ? e.preventDefault() : e.returnValue = false;
		});
	};

	this.prepSlides = function(slides) {
		var loaded = 0;
		var postaction = function(){};
		
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
		clearInterval(jbl.slidesInterval);
		jbl.slidesInterval = setInterval(function() {
			jbl.nextSlide();
		}, jbl.options.delay);
	};
	
	this.pause = function() {
		clearInterval(jbl.slidesInterval);
	};
	
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
		jbl.animationFrame = requestAnimationFrame(jbl.animate);
		jbl.timeElapsed = 0.0;
		var cnt = Object.keys(jbl.slides).length;
		
		if(jbl.timeStart == 0) {
			jbl.timeStart = new Date().getTime();
		}
		jbl.animating = true;
		var t = new Date().getTime();
		
		jbl.paused = false;
		jbl.timeElapsed = t - jbl.timeStart;
		
		var percent = jbl.timeElapsed / jbl.options.duration;
		jbl.ap = percent > 1.0 ? 1.0 : percent;
		
		switch(jbl.options.animationType) {
			case 'slide':
				if(jbl.current == 0 && jbl.next == cnt - 1) {
					jbl.slideRight();
				} else if(jbl.current == cnt - 1 && jbl.next == 0) {
					jbl.slideLeft();
				} else if(jbl.current > jbl.next) {
					jbl.slideRight();
				} else {
					jbl.slideLeft();
				}
				
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
				break;
			case 'fade':
			default:
				jbl.fade();
				if(percent >= 1) {
					$(jbl.slides[jbl.current].element).children('span').hide();
				};
				
				$(jbl.slides[jbl.next].element).show();
				$(jbl.slides[jbl.next].element).children('span').show();
				$(jbl.slides[jbl.current].element).css({
					'opacity': jbl.slides[jbl.current].opacity,
					'z-index': 2
				});
				$(jbl.slides[jbl.next].element).css({
					'opacity': jbl.slides[jbl.next].opacity,
					'z-index': 3
				});
				break;
		}
		
		if(percent >= 1) {
			cancelAnimationFrame(jbl.animationFrame);
			$(jbl.slides[jbl.current].element).hide();
			jbl.timeStart = 0;
			jbl.timeElapsed = 0;
			jbl.current = jbl.next;
			jbl.animating = false;
		}
	};
	
	this.slideLeft = function() {
		jbl.slides[jbl.current].pos = {x: Math.round(jbl.slides[jbl.current].width * jbl.ap * -1) - Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0};
		jbl.slides[jbl.next].pos = {x: jbl.slides[jbl.next].width - Math.round(jbl.slides[jbl.next].width * jbl.ap) - Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
	}
	
	this.slideRight = function() {
		jbl.slides[jbl.current].pos = {x: Math.round(jbl.slides[jbl.current].width * jbl.ap) - Math.round((jbl.slides[jbl.current].width - $(jbl.slides[jbl.current].element).width()) / 2), y: 0};
		jbl.slides[jbl.next].pos = {x: -jbl.slides[jbl.next].width + Math.round(jbl.slides[jbl.next].width * jbl.ap) - Math.round((jbl.slides[jbl.next].width - $(jbl.slides[jbl.next].element).width()) / 2), y: 0};
	}
	
	this.fade = function() {
		jbl.slides[jbl.current].opacity = 1 - jbl.ap;
		jbl.slides[jbl.next].opacity = 1 * jbl.ap;
	}
	
	return this.each(function() {
		jbl.init(this);
	});
};
}( jQuery ));