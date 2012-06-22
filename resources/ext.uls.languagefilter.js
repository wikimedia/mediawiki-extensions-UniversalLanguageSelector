/*
 * @author Santhosh Thottingal
 * jQuery autocomplete based language filter widget
 * Usage: $('inputbox').languagefilter();
 * The values for autocompletion is from the data-languages of the element.
 * the data is in the format of languagecode:languagename format.
 * Credits: http://jqueryui.com/demos/autocomplete
 */
jQuery( function( $ ) {
	"use strict";

	$.widget( "ui.languagefilter", {
		options: {
			$target: null, // where to append the results
			languages: null, // languages as code:name format. default values is from data-languages
			clickhandler: null
		},
		_create: function() {
			var self = this.element,
			options = this.options;
			$( self ).autocomplete( {
				delay: 0,
				minLength: 0,
				// Move the default dropdown for suggestions to somewhere
				// where it is not visible, since we don't use it.
				position: { offset: "-10000 -10000" },
				source:  function( request, response ) {
					var term = request.term;
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), 'i' );
					var languages = options.languages;

					if ( languages === null ) {
						// Apparently .data automatically parses valid looking JSON
						languages = $( self ).data( 'languages' );
					}

					response( $.map( languages, function ( name, code ) {
						if ( term === "" ) {
							return { label: name, value: code };
						}
						if ( matcher.test( name ) ) {
							return {
								label: name.replace(
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

			$( self ).data( "autocomplete" )._renderItem = function ( ul, item ) {
				var $target = ul;
				if ( options.$target ) {
					$target = options.$target;
				} else {
					return;
				}
				var $li = $( "<li>" )
					.data( "item.autocomplete", item )
					.append( $( "<a>" ).prop( 'href', '#' ). html( item.label ) )
					.appendTo( $target );
				if ( options.clickhandler ) {
					$li.click( function() {
						options.clickhandler.call( this, item );
					} );
				}
				return $li;

			};
		}, // End of _create

		destroy: function() {
			$.Widget.prototype.destroy.call( this );
		}
	} );
} );
