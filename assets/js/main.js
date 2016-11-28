jQuery(document).ready(function($) {
	// fitVids.
	$( '.entry-content' ).fitVids();

	// Responsive wp_video_shortcode().
	$( '.wp-video-shortcode' ).parent( 'div' ).css( 'width', 'auto' );

	/**
	 * Odin Core shortcodes
	 */

	// Tabs.
	$( '.odin-tabs a' ).click(function(e) {
		e.preventDefault();
		$(this).tab( 'show' );
	});

	// Tooltip.
	$( '.odin-tooltip' ).tooltip();

	//menu
	var aux = false;
	$('#icon-menu').click(function(event) {	
		event.preventDefault();	
		if(aux === false){
			$('#navigation').addClass('navigation-active');
			$('#navigation').find('.menu').fadeIn(400);
			aux = true;
		}else{
			$('#navigation').removeClass('navigation-active');
			$('#navigation').find('.menu').fadeOut(400);
			aux = false;
		}
		return false;
	});

	$('#menu a').click(function(event) {
		event.preventDefault();
		setTimeout(function(){
			$('#icon-menu').trigger('click');
		},1000);
	});


	$('#grid').gridalicious({ width: 357 });
	$('#grid1').gridalicious({ width: 357 });
	$('#grid2').gridalicious({ width: 357 });
	$('#grid3').gridalicious({ width: 357 });
	$('#grid4').gridalicious({ width: 357 });

});
