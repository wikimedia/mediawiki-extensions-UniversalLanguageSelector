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
			var that = this;
			var languages = this.options.languages;
			var query = this.$element.val();
			var allLanguages = $.uls.data.allLanguagesByScriptGroup();
			for ( var scriptGroup in allLanguages ) {
				for ( var langNum = 0; langNum < allLanguages[scriptGroup].length; langNum++ ) {
					var langCode = allLanguages[scriptGroup][langNum];
					if ( languages[langCode] !== undefined && ( query === "" || that.filter( langCode, query ) ) )
					{
						that.render( langCode );
					}
				}
			}
		},

		render: function( langCode ) {
			var that = this;
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			$target.append( langCode );
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
			var matcher = new RegExp( this.escapeRegex( searchTerm ), 'i' );
			var languageName = this.options.languages[langCode];
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
		clickhandler: null
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
			var that = this,
				regionGroups = $.uls.data.regiongroups,
				regions = $.uls.data.regions( langCode );
			// 1. loop over all regiongroups - like {EU: 2, AF: 2, AS: 3 ...}
			// 2. check that the region matches the active region group
			// 3. if this language is included in that region, show it
			// 4. if none of the conditions match, the language is not shown
			$.each( regionGroups, function( region, regionGroup) {
				if ( regionGroup === that.regionGroup && $.inArray( region, regions ) >= 0 ) {
					that.render( langCode, region );
					return;
				}
			} );
		},

		show: function() {
			var that = this;

			// Make the selected region (and it only) active
			$( '.regionselector' ).removeClass( 'active' );
			that.$element.addClass( 'active' );

			// Repopulate the list of languages
			that.options.$target.empty();

			var regions = $.uls.data.regionsInGroup( that.regionGroup );
			var languagesInRegion = $.uls.data.languagesByScriptGroupInRegions( regions );
			for ( var scriptGroup in languagesInRegion ) {
				for ( var langNum = 0; langNum < languagesInRegion[scriptGroup].length; langNum++ ) {
					that.test( languagesInRegion[scriptGroup][langNum] );
				}
			}

			if ( that.options.callback ) {
				that.options.callback.call();
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
		callback: null // Callback - will be called after results are displayed.
	};

	$.fn.regionselector.Constructor = RegionSelector;

} )( jQuery );
