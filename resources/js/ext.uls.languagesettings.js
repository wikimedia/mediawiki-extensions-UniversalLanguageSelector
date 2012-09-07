/**
 * ULS-based language settings dialog for MediaWiki.
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

( function( $ ) {
	"use strict";

	var closeRow = '<div class="row">' +
		'<span id="languagesettings-close" class="icon-close"></span>' +
		'</div>';
	var settingsMenu = '<div class="four columns languagesettings-menu">' +
		'<h1>Language settings</h1>' + // TODO i18n
		'<div class="settings-menu-items">' +
		'</div>' +
		'</div>';
	var settingsPanel = '<div id="languagesettings-settings-panel" class="eight columns">' +
		'</div>';
	var panelsRow = '<div class="row" id="languagesettings-panels">' +
		settingsMenu +
		settingsPanel +
		'</div>';
	var windowTemplate = '<div style="display: block;" id="language-settings-dialog" class="uls-menu">' +
		closeRow +
		panelsRow +
		'</div>';

	var LanguageSettings = function ( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.languagesettings.defaults, options );
		this.$window = $( this.options.template );
		this.shown = false;
		this.initialized = false;
		this.left = this.options.left;
		this.top = this.options.top;
		this.$settingsPanel = this.$window.find( "#languagesettings-settings-panel" );
		this.init();
		this.listen();
	};

	LanguageSettings.prototype = {
		constructor: LanguageSettings,

		init: function () {
			$( "body" ).append( this.$window );
			this.hide();
		},

		listen: function () {
			var that = this;
			// Register all event listeners to the ULS language settings here.
			that.$element.on( "click", $.proxy( that.show, that ) );
			that.$window.find( 'languagesettings-close' )
				.on( "click", $.proxy( that.hide, that ) );
		},

		render: function () {
			// Get the name of all registered modules and list them in left side menu.
			var modules = $.fn.languagesettings.modules;
			var firstModule = modules[this.options.defaultModule];
			for ( var moduleName in modules ) {
				if ( modules.hasOwnProperty( moduleName ) ) {
					if ( !firstModule ) {
						firstModule = new modules[moduleName]( this );
					}
					// Call render function on the current setting module.
					this.renderModule( moduleName );
				}
			}

			// Show the default module
			firstModule.render();
		},

		renderModule: function ( moduleName ) {
			var $settingsMenuItems = this.$window.find( ".settings-menu-items" );
			var module = new $.fn.languagesettings.modules[moduleName]( this );
			var $settingsTitle = $( "<div>" )
				.addClass( "settings-title" )
				.text( module.name );
			var $settingsText = $( "<span>" )
				.addClass( "settings-text" )
				.text( module.description );
			var $settingsLink = $( "<div>" )
				.addClass( moduleName + "-settings-block menu-section" )
				.prop( "id", moduleName + "-settings-block" )
				.data( "module", module )
				.append( $settingsTitle )
				.append( $settingsText );

			$settingsMenuItems.append( $settingsLink );

			$settingsLink.on( "click", function () {
				var module = $( this ).data( "module" );
				module.render();
				$( this ).addClass( 'active' );
			} );
		},

		show: function () {
			if ( !this.initialized ) {
				this.render();
				this.initialized = true;
				var pos = $.extend( {}, this.$element.offset(), {
					height: this.$element[0].offsetHeight
				} );
				var top = this.top || pos.top + pos.height;
				var left = this.left || '25%';
				// FIXME this is not exactly correct. position may not
				// be relative to the trigger.
				this.$window.css( {
					top: top,
					left: left
				} );
			}

			this.shown = true;
			this.$window.show();
		},

		hide: function() {
			this.shown = false;
			this.$window.hide();
		},

		click: function ( e ) {
			if ( !this.shown ) {
				this.show();
			}
		}
	};

	$.fn.languagesettings = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( "languagesettings" ),
				options = typeof option === "object" && option;

			if ( !data ) {
				$this.data( "languagesettings", ( data = new LanguageSettings( this, options ) ) );
			}
			if ( typeof option === "string" ) {
				data[option]();
			}
		} );
	};

	$.fn.languagesettings.modules = {};
	$.fn.languagesettings.defaults = {
		settings: {},
		template: windowTemplate,
		modules: {},
		defaultModule: false,
		top: null,
		left: null
	};

	$.fn.languagesettings.Constructor = LanguageSettings;

}( jQuery ) );
