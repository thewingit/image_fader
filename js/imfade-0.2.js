/*
 * jQuery image fader v.0.2
 *
 * Author: Michele Iafrancesco
 * From an idea of Simon Battersby
 * http://www.simonbattersby.com/blog/simple-jquery-image-crossfade
 *
 * jQuery plugin template based on Basic jQuery Slider plug-in by John Cobb
 * http://www.basic-slider.com
 *
 */


;(function($) {

    "use strict";

    $.fn.imageFader = function(o) {
        
        // slider default settings
        var defaults        = {
            frameWidth		: '480px',	// width of the image frame (as css string, e.g. '100%' or '480px' or 'auto')
            frameHeight		: '360px',	// height of the image frame ((as css string, e.g. '100%' or '480px' or 'auto')
            animduration    : 1000,		// length of transition (in milliseconds)
            animspeed       : 10000 	// delay between transitions (in milliseconds)
        };
		
		// create settings from defauls and user options
        var settings        = $.extend({}, defaults, o);
		
		// creates caption container div and caption span
		this.append('<div id="imfade-caption"><span></span></div>');
		
		// retrieves handler to html objects
		var $wrapper 		= this;
		var $imageFrame 	= $wrapper.find('#imfade-images');
		var $images 		= $wrapper.find('img');
		var $captionFrame	= $wrapper.find('#imfade-caption');

            
        // Creates/initializes fader elements
        var init = function() {
			
			// sets frame wrapper width and height
			$wrapper.css({
				'width'  : settings.frameWidth,
				'height' : settings.frameHeight
			});
            // wait for complete load of the images before triggering animation
			$imageFrame.css('visibility','hidden');
			$wrapper.css('background','url(images/loading.gif) center center no-repeat');
			var timer = setInterval( function() {
				var i;
				var loaded = 0;
				for( i=0;i<$images.length;i++) {
					if( $images[i].complete==true )
						loaded++;
				}
				if(loaded == $images.length) {
					clearInterval(timer);
					$wrapper.css('background','none');
					$imageFrame.css('visibility','visible');
					// triggers fader first start
					initFader();
				}
			} , 200 );	

        };
		
		
		// Initializes fader timers
		var initFader = function() {
		
			// check if there is a caption on the first image
			if (!!$imageFrame.children('img.active').attr('title')) {
				// insert text into caption span
				var cText = $imageFrame.children('img.active').attr('title');
				$captionFrame.children('span').text(cText);
				// Quick fix for DOM bug: wait some time before getting span's size
				setTimeout(function(){ 
					var cWidth  = $captionFrame.children('span').innerWidth();
					var cHeight = $captionFrame.children('span').innerHeight();
					// set caption div with the span's dimentions
					$captionFrame.css({
						"width"  : cWidth +"px",
						"height" : cHeight +"px"
					});
					$captionFrame.children('span').css("right","12px");
					// trigger image fade function periodically
					setInterval(function() {
                    	triggerFader();
                	}, settings.animspeed);
				}, 200);
			} else {
				// trigger image fade function periodically
				setInterval(function() {
                    	triggerFader();
                }, settings.animspeed);
			}
			
		}
		
		// Triggers a single image crossfade (with caption animation also)
		var triggerFader = function() {
			
			// slide out the old caption if present
			if ($captionFrame.children('span').text().length > 0) {
				slideOutCaption();
			// crossfade image directly
			} else {
				crossFadeImage();
			}
			
		}
		
		// Slide out the caption text
		var slideOutCaption = function() {
			
			// get the handlers for the caption
			var $caption = $captionFrame.children('span');
			
			// fix caption div to the right side of parent
			$caption.css({
				"right"  : $captionFrame.css("padding-right"),
				"left"  : "auto",
			});
			
			// triger caption slide-out animation
			$captionFrame.animate({width:"0px"}, settings.animduration, function(){
				// after animation, set text of caption span empty
				// hide it by putting it on a low z-index and trigger
				// image fade animation function
				$caption.text('');	
				$captionFrame.css({"z-index" : 1});
				crossFadeImage();
			});
		}
		
		// Cross fade active and next image
		var crossFadeImage = function(){
			
			// get handlers for current active image next image to be processed
			var $active = $imageFrame.children('img.active'); 
			var $next = ($active.next().length > 0) ? $active.next() : $imageFrame.children('img:first'); // 
			
			// move the next image up the pile
			$next.css('z-index',2);
			// fade out the top image
			$active.fadeOut(settings.animduration, function(){
				//reset the z-index and unhide the image
				$active.css('z-index',1).show().removeClass('active');
				//make the next image the top one
				$next.css('z-index',3).addClass('active');
				// if title attribute of current active image is set and not empty, trigger the slide-in of the caption
				// once crossfade animation has finished
				if (!!$imageFrame.children('img.active').attr('title')) {
					slideInCaption();
				}
			});
			
		}
		
		// slide in new caption for active image
		var slideInCaption = function() {
			
			// gets the text to be slided in
			var cText = $imageFrame.children('img.active').attr('title');
			
			// gets handlers to caption elements
			var $caption = $captionFrame.children('span');
			
			// set text inside span
			$caption.text(cText);	
			// get current width & height of span after new text was inserted
			var cWidth = $caption.innerWidth();	
			var cHeight =  $caption.innerHeight();
			// set caption div to the child span's dimensions
			$captionFrame.css({
				"width"  : cWidth+"px",
				"height" : cHeight+"px",
			});
			
			// calculate caption div top and left distances to parent so to fit the right-
			// bottom corner of the parent with 10px distance
			var contTop  = $wrapper.innerHeight() - $captionFrame.outerHeight() - 10;
			var contLeft = $wrapper.innerWidth() - $captionFrame.outerWidth() - 10;
			
			// Set caption div css so to be ready for animation
			$captionFrame.css({
				"width"    : "0px",		// set width to 0px so to initially hide caption
				"top"      : contTop, 	// fix top distance to parent
				"left"     : contLeft,	// fix left distance to parent
				"bottom"   : "auto",	// remove fix to parent's bottom distance
				"right"    : "auto", 	// remove fix to parent's bottom distance
				"z-index"  : 4,   		// bring element to the foreground
			}); 
			// fix caption span to left of caption div
			$caption.css({
				"left"  : $captionFrame.css("padding-left"),
				"right"  : "auto",
			});
			
			// trigger caption slide-in animation
			// stretch width to previously calculated value
			$captionFrame.animate({width:cWidth}, settings.animduration, function(){
				// after animation, reset caption div fixing distance to parent
				$captionFrame.css({
					"bottom" : "10px",
					"right"  : "10px",
					"top"    : "auto",
					"left"   : "auto"	
				})	
			});
		}
		

        // lets get the party started :)
        init();

    };
	

})(jQuery);
