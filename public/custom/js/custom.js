

$(document).ready(function(){  
	
    if(window.location.pathname.match(/[^\/]+$/) != null){
		var pathname = (window.location.pathname.match(/[^\/]+$/));
		
		$('.uk-navbar-nav a, .uk-nav-navbar a, .uk-nav-offcanvas > li > a, .uk-nav-offcanvas ul a').each(function() {
			if ( $(this).attr('href') == pathname ) {
				$(this).addClass('active');
				$(this).closest('li.uk-parent').children('a').addClass('active');
			}
		});
	}
	else
	{
		$('.uk-navbar-nav a, .uk-nav-navbar a, .uk-nav-offcanvas > li > a, .uk-nav-offcanvas ul a').first().addClass('active');
	}
	
	
	$('.date-picker-custom').datepicker({
		
		changeMonth: true,
		changeYear: true,
		dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		
	});
	
	
	
	$(".price-range-slider").slider({
		max: 600,
		min: 1,
		range: true,
		values: [20, 300]
	})
	.slider("float", {
		rest: 'pip',
		prefix: '$'
	});
	
	
	$('.spinner.one .btn:first-of-type').on('click', function() {
		$('.spinner.one input').val( parseInt($('.spinner.one input').val(), 10) + 1);
	});
	$('.spinner.one .btn:last-of-type').on('click', function() {
		$('.spinner.one input').val( parseInt($('.spinner.one input').val(), 10) - 1);
	});
	
	
	$('.spinner.two .btn:first-of-type').on('click', function() {
		$('.spinner.two input').val( parseInt($('.spinner.two input').val(), 10) + 1);
	});
	$('.spinner.two .btn:last-of-type').on('click', function() {
		$('.spinner.two input').val( parseInt($('.spinner.two input').val(), 10) - 1);
	});
	
	
	$(".cart-item-close").click(function(){
		
		$(this).parentsUntil(".shopping-bag-list").fadeOut(500);
		$(this).remove();
	});
	
	
}); 

$(document).ready(function(){
	var current_fs, next_fs, previous_fs; 
	var left, opacity, scale; 
	var animating; 
	
	$(".next").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).closest("fieldset");
		next_fs = $(this).closest("fieldset").next();
		
		$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
		
		next_fs.show(); 
		current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				scale = 1 - (1 - now) * 0.2;
				left = (now * 50)+"%";
				opacity = 1 - now;
				current_fs.css({
					'transform': 'scale('+scale+')',
					'position': 'absolute'
				});
				next_fs.css({'left': left, 'opacity': opacity});
			}, 
			duration: 800, 
			complete: function(){
				current_fs.hide();
				animating = false;
			}, 
			
			easing: 'easeInOutSine'
		});
	});
	
	$(".previous").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).closest("fieldset");
		previous_fs = $(this).closest("fieldset").prev();
		
		
		$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
		
		previous_fs.show(); 
		current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				scale = 0.8 + (1 - now) * 0.2;
				left = ((1-now) * 100)+"%";
				opacity = 1 - now;
				current_fs.css({'left': left});
				previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
			}, 
			duration: 800, 
			complete: function(){
				current_fs.hide();
				animating = false;
			}, 
			
			easing: 'easeInOutBack'
		});
	});
	
	$(".submit").click(function(){
		return false;
	});
});

jQuery(document).ready(function($) {
	$('.counter').counterUp({
		delay: 30,
		time: 3000
	});
});

$(document).ready(function(){
	var myVideo = document.getElementById("video-element");
	
	function playPause() {
		if (myVideo.paused)
		{
		    myVideo.play();
			$("video").removeClass("uk-invisible");
			$(".play-btn").addClass("atma_video_btn_hover")
		}
		else {
		    myVideo.pause();
			$("video").addClass("uk-invisible");
			$(".play-btn").removeClass("atma_video_btn_hover")
		}
	}
	$(".play-btn").click(function(){
		playPause(); 
	});
});

$(document).ready(function(){  
// 	function init_map() {
// 		var myOptions = {
// 			zoom: 12,
// 			center: new google.maps.LatLng(39.465797, -76.743746),
// 			mapTypeId: google.maps.MapTypeId.ROADMAP,
// 			scrollwheel: false
// 		};
// 		var markerOptions = {
// 			position: new  google.maps.LatLng(39.465797, -76.743746)
// 		};
// 		var map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
// 		var marker = new google.maps.Marker({
// 			map: map,
// 			icon: "images/map_marker.png",
// 			position: new google.maps.LatLng(39.465797, -76.743746)
// 		});
// 		var infoWindowOptions = {
// 			content: 'Elvin is here!'
// 		};
		
// 		var infoWindow = new google.maps.InfoWindow(infoQWindowOptions);
// 				google.maps.event.addListener(marker, 'click', function() {
// 			infowindow.open(map, marker);
// 		});
		
// 	}
// 	google.maps.event.addDomListener(window, 'load', init_map);
	
// });
handler = Gmaps.build('Google');
handler.buildMap({ provider: {}, internal: {id: 'map'}}, function(){
  markers = handler.addMarkers([
    {
      "lat": 0,
      "lng": 0,
      "picture": {
        "url": "http://people.mozilla.com/~faaborg/files/shiretoko/firefoxIcon/firefox-32.png",
        "width":  32,
        "height": 32
      },
      "infowindow": "hello!"
    }
  ]);
  handler.bounds.extendWith(markers);
  handler.fitMapToBounds();
});
});
$(document).ready(function() {
	
	var $window = $(window),
	flexslider;
	
	function getGridSize() {
		return (window.innerWidth < 600) ? 2 :
		(window.innerWidth < 900) ? 3 : 4;
	}
	
	$window.load(function() {
		$('.flex-carousel').flexslider({
			animation: "slide",
			directionNav: false,
			controlNav: false,
			animationLoop: false,
			itemWidth: 116,
			itemMargin: 27,
			asNavFor: '.flex-slider',
			minItems: getGridSize(),
			maxItems: getGridSize() 
		});
	});
	
	$('.flex-slider').flexslider({
		
		slideshow: true,
		animation: "slide",
		directionNav: false,
		animationLoop: false,
		sync: ".flex-carousel"
	});
}());




