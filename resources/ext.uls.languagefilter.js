/*
 * @author Santhosh Thottingal
 * jQuery autocomplete based language filter widget
 * Usage: $('inputbox').languagefilter();
 * The values for autocompletion is from the data-languages of the element.
 * the data is in the format of languagecode:languagename format.
 * Credits: http://jqueryui.com/demos/autocomplete
 */
(function ( $ ) {
	"use strict";

	var LanguageFilter = {
		_create: function() {
			var that = this;
			var self = that.element,
			options = that.options;
			$( self ).autocomplete( {
				delay: 0,
				minLength: 0,
				// Move the default dropdown for suggestions to somewhere
				// where it is not visible, since we don't use it.
				position: { offset: "-10000 -10000" },
				source:  function( request, response ) {
					var term = request.term;
					var languages = options.languages;
					response( $.map( $.uls.data.languages, function ( languageDef, code ) {
						if ( term === "" ) {
							return { label: languages[code], value: code };
						}
						if ( that.filter( code, term ) ) {
							return {
								label: languages[code].replace(
									new RegExp(
									"(?![^&;]+;)(?!<[^<>]*)(" +
									$.ui.autocomplete.escapeRegex( term ) +
									")(?![^<>]*>)(?![^&;]+;)", "gi"
									), "<strong>$1</strong>" ),
								value: code
							};
						}
					} ) );
				},
				search: function ( event, ui ) {
					if ( options.$target ){
						options.$target.empty();
					}
				}
			} ); // /autocomplete

			$( self ).data( "autocomplete" )._renderItem = function ( $target, item ) {
				$target = options.$target;
				if ( !$target ) {
					return;
				}
				var $li = $( "<li>" )
					.data( "code", item.value )
					.data( "item.autocomplete", item )
					.append( $( "<a>" ).prop( 'href', '#' ). html( item.label ) )
					.appendTo( $target );

				if ( options.clickhandler ) {
					$li.click( function() {
						options.clickhandler.call( this, item.value );
					} );
				}
				return $li;
			};
		}, // End of _create

		destroy: function() {
			$.Widget.prototype.destroy.call( this );
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
			var script = $.uls.data.languages[code][0];
			// FIXME script is ISO 15924 code. We might need actual name of script.
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex( searchTerm ), 'i' );
			return matcher.test( langName ) || matcher.test( autonym ) || matcher.test( code ) || matcher.test( script );
		},

		options: {
			$target: null, // where to append the results
			languages: null, // languages as code:name format. default values is from data-languages
			clickhandler: null
		}
	};

	$.widget( "ui.languagefilter", LanguageFilter );


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