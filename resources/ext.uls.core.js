(function($) {
	"use strict";

	var ULS = function(element, options) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( this.options.menu ).appendTo( 'body' );
		this.shown = false;
		this.render();
		this.listen();
	}

	ULS.prototype = {
		constructor : ULS,
		show : function() {
			var pos = $.extend( {}, this.$element.offset(), {
				height : this.$element[0].offsetHeight
			} );

			this.$menu.css( {
				top : pos.top + pos.height,
				left : '25%' //pos.left // FIXME
			} );

			this.$menu.show();
			this.shown = true;
			return this;
		},
		hide : function() {
			this.$menu.hide();
			this.shown = false;
			return this;
		},
		render: function(){
			// TODO : All UI construction code to go here.
			var $heading = $("<h2>").text(mw.msg("uls-select-content-language"));
			this.$menu.append($heading);
			var $wordldMap = $("<div id='worldmap'>");
			this.$menu.append($wordldMap);
		},
		listen : function() {
			// Register all event listeners to the ULS here.
			this.$element.on( 'click', $.proxy( this.click, this ) );
			this.$menu.on( 'keyup', $.proxy( this.click, this ) )
				.on( 'keypress', $.proxy( this.click, this ) );
		},
		keyup : function(e) {
			switch(e.keyCode) {
				case 27:
					// escape
					if (!this.shown ) {
						return this.hide();
					}
					break;
			}

			e.stopPropagation();
			e.preventDefault();
		},
		keypress : function(e) {
			if (!this.shown )
				return;

			switch(e.keyCode) {
				case 27:
					// escape
					e.preventDefault();
					break;
			}
			e.stopPropagation();
		},
		click : function(e) {
			e.stopPropagation();
			e.preventDefault();
			if ( !this.shown ) {
				this.show();
			} else {
				this.hide();
			}
		},
	}

	/* ULS PLUGIN DEFINITION
	 * =========================== */

	$.fn.uls = function(option) {
		return this.each( function() {
			var $this = $( this ), data = $this.data( 'uls' ), options = typeof option == 'object' && option;
			if (!data )
				$this.data( 'uls', ( data = new ULS(this, options)) );
			if ( typeof option == 'string' )
				data[option]();
		} )
	};

	$.fn.uls.defaults = {
		// FIXME  Menu template. Can it come from PHP?
		menu : '<div class="uls-menu"><a class="close button">x</a></div>',
	};

	$.fn.uls.Constructor = ULS;

} )( jQuery );
