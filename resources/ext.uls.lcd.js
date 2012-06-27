(function( $ ) {
	"use strict";

	var LanguageCategoryDisplay = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.lcd.defaults, options );
		this.$element.addClass( 'lcd' );
		this.show();
		this.listen();
	};

	LanguageCategoryDisplay.prototype = {
		constructor: LanguageCategoryDisplay,

		append: function( langCode, regionGroup ) {
			var that = this;
			this.addToRegion( langCode, regionGroup );
		},

		addToRegion: function( langCode, regionGroup ) {
			var that = this,
				language = $.uls.data.languages[langCode];

			if ( !language ) {
				console.log( "Definition for " + langCode + " was not found in the language database." );
				return;
			}

			var langName = that.options.languages[langCode];

			var regions = $.uls.data.regions( langCode );
			for ( var i = 0; i < regions.length; i++ ) {
				var regionCode = regions[i];

				if ( regionGroup && regionCode !== regionGroup ) {
					continue;
				}

				var $li = $( '<li>' )
					.data( 'code', langCode )
					.append(
						$( '<a>' ).prop( 'href', '#' ).html( langName )
					);
				that.getColumn( regionCode ).append( $li );
				if ( that.options.clickhandler ) {
					$li.click( function() {
						that.options.clickhandler.call( this, langCode );
					} );
				}
			}
		},

		getColumn: function( regionCode ) {
			var $ul = $( "div#" + regionCode ).find( 'ul:last' );
			if ( $ul.length === 0 || $ul.find( 'li' ).length >= 10) {
				$ul = $( '<ul>' );
				$( 'div#' + regionCode ).append( $ul );
			}
			$( 'div#' + regionCode ).show();
			return $ul;
		},

		show: function() {
			var that = this;
			$.each( $.uls.data.regiongroups, function( regionCode, regionIndex ) {
				var $section = $( '<div>' ).addClass( 'uls-lcd-region-section' ).prop( 'id', regionCode );
				$section.append( $( '<h3>' ).html( regionCode ) );
				// FIXME this is regioncode(NA, EU etc). Should be Proper localized region name.
				$section.append( $( '<ul>' ) );
				that.$element.append( $section );
			} );
		},

		empty: function() {
			this.$element.find( 'div ul' ).remove();
			this.$element.find( 'div' ).hide();
		},

		listen: function(){
			this.$element.scroll( function() {
				var inviewRegion = $( 'div.uls-lcd-region-section:in-viewport:first' ).attr( 'id' );
				var inview = $.uls.data.regiongroups[inviewRegion];
				$( 'div.uls-region' ).removeClass( 'active' );
				$( 'div#uls-region-' + inview).addClass( 'active' );
			});
		}

	};

	$.fn.lcd = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'lcd' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'lcd', ( data = new LanguageCategoryDisplay( this, options ) ) );
			}
			if ( typeof option === 'string') {
				data[option]();
			}
		} );
	};

	$.fn.lcd.defaults = {
		languages: null
	};

	$.fn.lcd.Constructor = LanguageCategoryDisplay;

} )( jQuery );
