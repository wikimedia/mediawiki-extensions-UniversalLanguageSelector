/**
 * jQuery language filter plugin.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

/**
 * Usage: $( 'inputbox' ).languagefilter();
 * The values for autocompletion is from the options.languages.
 * The data is in the format of languagecode:languagename.
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
				this.$element.on( 'keydown', $.proxy( this.keyup, this ) );
			}
		},

		keyup: function( e ) {
			this.options.$target.empty();
			this.search();
		},

		search: function() {
			var query = $.trim( this.$element.val() ),
				languages = $.uls.data.languagesByScriptGroup( this.options.languages ),
				scriptGroup, langNum, langCode;
			for ( scriptGroup in languages ) {
				for ( langNum = 0; langNum < languages[scriptGroup].length; langNum++ ) {
					langCode = languages[scriptGroup][langNum];
					if ( query === "" || this.filter( langCode, query ) ) {
						this.render( langCode );
					}
				}
			}
			// Also do a search to search API
			if( this.options.searchAPI && query){
				this.searchAPI( query );
			}
		},

		searchAPI: function( query ) {
			var that = this;
			$.get( that.options.searchAPI, { search: query }, function( result ) {
				$.each( result['languagesearch'], function( code, name ) {
					that.render( code, name );
				} );
			} );
		},

		render: function( langCode, languageName ) {
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			$target.append( langCode, null, languageName );
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
		filter: function( langCode, searchTerm ) {
			// FIXME script is ISO 15924 code. We might need actual name of script.
			var matcher = new RegExp( this.escapeRegex( searchTerm ), 'i' ),
				languageName = this.options.languages[langCode];
			return matcher.test( languageName ) ||
				matcher.test( $.uls.data.autonym( langCode ) ) ||
				matcher.test( langCode ) ||
				matcher.test( $.uls.data.script( langCode ) );
		}

	};

	$.fn.languagefilter = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'languagefilter' ),
				options = typeof option === 'object' && option;
			if ( !data ) {
				$this.data( 'languagefilter', ( data = new LanguageFilter( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.languagefilter.defaults = {
		$target: null, // Where to append the results
		languages: null, // Languages as code:name format. Default values come from data.languages.
		clickhandler: null,
		searchAPI: null
	};

	$.fn.languagefilter.Constructor = LanguageFilter;

	/* RegionSelector Plugin Definition */

	/**
	 * Region selector is a language selector based on regions.
	 * Usage: $( 'jqueryselector' ).regionselector( options );
	 * The attached element should have data-regiongroup attribute
	 * that defines the regiongroup for the selector.
	 */
	var RegionSelector = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.regionselector.defaults, options );
		this.$element.addClass( 'regionselector' );
		this.listen();
		this.regionGroup = this.$element.data( 'regiongroup' );
	};

	RegionSelector.prototype = {
		constructor: RegionSelector,

		test: function( langCode ) {
			var regions = $.uls.data.regionsInGroup( this.regionGroup ),
				langRegions = $.uls.data.regions( langCode ),
				region;
			for ( var i = 0; i < regions.length; i++ ) {
				region = regions[i];
				if ( $.inArray( region, langRegions ) >= 0 ) {
					this.render( langCode, region );
					return;
				}
			}
		},

		show: function() {
			var i, regions, language, languagesByScriptGroup, scriptGroup, languages;
			// Make the selected region (and it only) active
			$( '.regionselector' ).removeClass( 'active' );
			this.$element.addClass( 'active' );

			// Re-populate the list of languages
			this.options.$target.empty();
			regions = $.uls.data.regionsInGroup( this.regionGroup );
			languagesByScriptGroup = $.uls.data.languagesByScriptGroup( this.options.languages );
			for ( scriptGroup in languagesByScriptGroup ) {
				languages = languagesByScriptGroup[scriptGroup];
				for ( i = 0; i < languages.length; i++) {
					language = languages[i];
					this.test( language );
				}
			}

			if ( this.options.callback ) {
				this.options.callback.call();
			}
		},

		render: function( langCode, region ) {
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			$target.append( langCode, region );
		},

		listen: function() {
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
				options = typeof option === 'object' && option;

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
		callback: null, // Callback - will be called after results are displayed.
		languages: null
	};

	$.fn.regionselector.Constructor = RegionSelector;

} )( jQuery );
