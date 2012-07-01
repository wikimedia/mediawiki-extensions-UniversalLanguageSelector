/**
 * @author Santhosh Thottingal
 * jQuery language filter plugin
 * Usage: $('inputbox').languagefilter();
 * The values for autocompletion is from the options.languages.
 * the data is in the format of languagecode:languagename format.
 */
(function ( $ ) {
	"use strict";

	var LanguageFilter = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.regionselector.defaults, options );
		this.$element.addClass( 'languagefilter' );
		this.listen();
	};

	LanguageFilter.prototype = {

		listen: function() {
			this.$element.on( 'keyup', $.proxy( this.keyup, this ));
			if ( $.browser.webkit || $.browser.msie ) {
				this.$element.on( 'keydown', $.proxy( this.keyup, this ) )
			};
		},

		keyup: function( e ) {
			this.options.$target.empty();
			this.search();
		},

		search: function() {
			var that = this;
			var languages = this.options.languages;
			var query = this.$element.val();
			$.each( languages, function ( name, code ) {
				if ( query === "" ) {
					that.render(code);
				}
				else if ( that.filter( code, query ) ) {
					that.render(code);
				}
			} ) ;
		},

		render : function( code ) {
			var that = this;
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			var $li = $( "<li>" )
				.data( "code", code )
				.append( $( "<a>" ).prop( 'href', '#' ). html( this.options.languages[code] || code ) )
				.appendTo( $target );

			if ( this.options.clickhandler ) {
				$li.click( function() {
					that.options.clickhandler.call( this, code );
				} );
			}
		},

		escapeRegex: function( value ) {
			return value.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
		},

		/**
		 * A search match happens if any of the following passes:
		 * a) Language name in current user interface language
		 * 'starts with' or 'contains' search string.
		 * b) Language autonym 'starts with' or 'contains' search string.
		 * c) ISO 639 code match with search string.
		 * d) ISO 15924 code for the script match the search string.
		 */
		filter: function( code, searchTerm ) {
			var languages = this.options.languages;
			var langName = languages[code];
			var autonym = $.uls.data.autonyms[code];
			var script =  $.uls.data.languages[code]? $.uls.data.languages[code][0]: "unknown";
			// FIXME script is ISO 15924 code. We might need actual name of script.
			var matcher = new RegExp( this.escapeRegex( searchTerm ), 'i' );
			return matcher.test( langName ) || matcher.test( autonym ) || matcher.test( code ) || matcher.test( script );
		}

	};

	$.fn.languagefilter = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'languagefilter' ),
				options = typeof option == 'object' && option;
			if ( !data ) {
				$this.data( 'languagefilter', ( data = new LanguageFilter( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.languagefilter.defaults = {
			$target: null, // where to append the results
			languages: null, // languages as code:name format. default values is from data-languages
			clickhandler: null,
	};

	$.fn.languagefilter.Constructor = LanguageFilter;


	/* RegionSelector Plugin Definition */

	/*
	 * Region selector is a language selector based on regions.
	 * Usage: $( 'jqueryselector' ).regionselector(options);
	 * The attached element should have data-region attribute
	 * that defines the region for the selector.
	 */
	var RegionSelector = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.regionselector.defaults, options );
		this.$element.addClass( 'regionselector' );
		this.listen();
		this.region = this.$element.data( 'region' );
	};

	RegionSelector.prototype = {
		constructor: RegionSelector,
		test: function( langCode ) {
			var that = this;
			var languages = that.options.source.languages;
			var regionGroups = that.options.source.regiongroups;
			var regions = languages[langCode][1];
			// 1. loop over all regions - like {EU: 2, AF: 2, AS: 3 ...}
			// 2. check that the region matches the active region group
			// 3. if this language is included in that region, show it
			// 4. if none of the conditions match, the language is not shown
			$.each( regionGroups, function( regionGroup, groupId ) {
				if ( groupId === that.region && $.inArray( regionGroup, regions ) >= 0 ) {
					that.render( langCode );
					return true;
				}
			} );
			return false;
		},
		show: function() {
			var that = this;
			var languages = that.options.source.languages;
			// Make the selected region (and it only) active
			$( '.regionselector' ).removeClass( 'active' );
			that.$element.addClass( 'active' );
			// Repopulate the list of languages
			that.options.$target.empty();
			$.each( languages, function( langCode, langDef ) {
				that.test( langCode );
			} );
			if ( that.options.callback ) {
				that.options.callback.call();
			}
		},
		render: function( langCode ) {
			var that = this;
			var langName = that.options.languages[langCode] || langCode;
			var $li = $( "<li>" )
					.data( "code", langCode )
					.append( $( "<a>" ).prop( 'href', '#' ).html( langName ) )
					.appendTo( this.options.$target );

			if ( that.options.clickhandler ) {
				$li.click( function() {
					that.options.clickhandler.call( this, langCode );
				} );
			}
		},
		listen: function(){
			this.$element.on( 'click', $.proxy( this.click, this ) );
		},
		click: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			this.show();
		}
	};
	/* RegionSelector Plugin Definition */

	$.fn.regionselector = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'regionselector' ),
				options = typeof option == 'object' && option;
			if ( !data ) {
				$this.data( 'regionselector', ( data = new RegionSelector( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.regionselector.defaults = {
		$target: null, // Where to render the results. Must be a ul element
		clickhandler: null, // Click handler to handle click events on results
		source: null, // The language database
		languages:null, // Language names for the current UI language
		callback: null // Callback - will be called after results are displayed.
	};

	$.fn.regionselector.Constructor = RegionSelector;


} )( jQuery );
