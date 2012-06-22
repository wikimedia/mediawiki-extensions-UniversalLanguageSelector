(function ( $, mw ) {
	"use strict";

	var ULS = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( this.options.menu );
		this.shown = false;
		this.render();
		this.listen();
	};

	ULS.prototype = {
		constructor: ULS,
		show: function() {
			var pos = $.extend( {}, this.$element.offset(), {
				height: this.$element[0].offsetHeight
			} );

			this.$menu.css( {
				top: pos.top + pos.height,
				left: '25%' //pos.left // FIXME
			} );

			this.$menu.show();
			this.shown = true;

			$( 'input#languagefilter' ).focus();
			return this;
		},
		hide: function() {
			this.$menu.hide();
			this.shown = false;
			return this;
		},
		render: function() {
			// Rendering stuff here
		},
		listen: function() {
			// Register all event listeners to the ULS here.
			this.$element.on( 'click', $.proxy( this.click, this ) );
			$( ".icon-close" ).on( 'click', $.proxy( this.click, this ) );
			$( "#languagefilter" ).languagefilter( {
				$target: $( 'ul.uls-language-filter-result' ),
				clickhandler: function( item ) {
					// TODO: dependency on MediaWiki
					var uri = new mw.Uri( window.location.href );
					uri.extend( { setlang: item.value } );
					window.location.href = uri.toString();
				}
			} );
			$( '.uls-region' ).live( 'click', function () {
				$( this ).parent().find( '.uls-region' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
			} );
			// trigger a search for all languages.
			$( "#languagefilter" ).autocomplete( "search" );
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
		keypress: function( e ) {
			if ( !this.shown ) {
				return;
			}

			switch( e.keyCode ) {
				case 27:
					// escape
					e.preventDefault();
					break;
			}
			e.stopPropagation();
		},
		click: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			if ( !this.shown ) {
				this.show();
			} else {
				this.hide();
			}
		},
	};

	/* ULS PLUGIN DEFINITION
	 * =========================== */

	$.fn.uls = function( option ) {
		return this.each( function() {
			var $this = $( this ), data = $this.data( 'uls' ), options = typeof option == 'object' && option;
			if ( !data ) {
				$this.data( 'uls', ( data = new ULS( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.uls.defaults = {
		menu : '.uls-menu',
	};

	$.fn.uls.Constructor = ULS;

} )( jQuery, mediaWiki );
