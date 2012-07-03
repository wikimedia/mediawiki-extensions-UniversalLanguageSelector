(function ( $ ) {
	"use strict";

	var ULS = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( this.options.menu );
		this.languages = this.$menu.data( 'languages' );
		for ( var code in this.languages ) {
			if ( $.uls.data.languages[code] === undefined ) {
				console && console.log && console.log( "ULS: Unknown language " + code + "." );
				delete this.languages[code];
			}
		}
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

		setLang: function( langCode ) {
			// TODO: dependency on MediaWiki
			var uri = new mw.Uri( window.location.href );
			uri.extend( { setlang: langCode } );
			window.location.href = uri.toString();
		},

		listen: function() {
			var that = this;
			// Register all event listeners to the ULS here.
			that.$element.on( 'click', $.proxy( that.click, that ) );
			$( ".icon-close" ).on( 'click', $.proxy( that.click, that ) );

			var $lcd = $( "div.uls-language-list" ).lcd( {
				languages: that.languages,
				clickhandler: function( langCode ) {
					that.setLang( langCode );
				}
			} ).data( "lcd" );
			$( "#languagefilter" ).languagefilter( {
				$target: $lcd, //$( 'ul.uls-language-filter-result' ),
				languages: that.languages
			} );

			// Create region selectors, one per region
			$( '.uls-region' ).regionselector( {
				$target: $lcd,
				// FIXME This is confusing: languages and source are actually data for ULS.
				languages: that.languages,
				callback: function () {
					// clear the search field.
					$( "#languagefilter" ).val( "" );
				}
			} );
			// trigger a search for all languages.
			$( "#languagefilter" ).languagefilter( "search" );
		},

		keyup: function( e ) {
			switch( e.keyCode ) {
				case 27: // escape
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
				case 27: // escape
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
		}

	};

	/* ULS PLUGIN DEFINITION
	 * =========================== */

	$.fn.uls = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'uls' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'uls', ( data = new ULS( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.uls.defaults = {
		menu: '.uls-menu'
	};

	$.fn.uls.Constructor = ULS;

} )( jQuery );
