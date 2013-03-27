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

( function ( $ ) {
	'use strict';

	var closeRow, settingsMenu, settingsPanel, windowTemplate, panelsRow;

	closeRow = '<div class="row">' +
		'<div class="uls-language-settings-close-block eight columns offset-by-four"><span id="languagesettings-close" class="icon-close"></span></div>' +
		'</div>';
	settingsMenu = '<div class="four columns languagesettings-menu">' +
		'<h1 data-i18n="ext-uls-language-settings-title"></h1>' +
		'<div class="settings-menu-items">' +
		'</div>' +
		'</div>';
	settingsPanel = '<div id="languagesettings-settings-panel" class="eight columns">' +
		'</div>';
	panelsRow = '<div class="row" id="languagesettings-panels">' +
		settingsMenu +
		settingsPanel +
		'</div>';
	windowTemplate = '<div style="display: block;" id="language-settings-dialog" class="grid uls-menu uls-wide">' +
		closeRow +
		panelsRow +
		'</div>';

	function LanguageSettings( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.languagesettings.defaults, options );
		this.$window = $( this.options.template );
		this.shown = false;
		this.initialized = false;
		this.left = this.options.left;
		this.top = this.options.top;
		this.$settingsPanel = this.$window.find( '#languagesettings-settings-panel' );
		this.init();
		this.listen();
	}

	LanguageSettings.prototype = {
		constructor: LanguageSettings,

		init: function () {
			$( 'body' ).append( this.$window );
			this.hide();
		},

		listen: function () {
			var langSettings = this;
			// Register all event listeners to the ULS language settings here.
			langSettings.$element.on( 'click', $.proxy( langSettings.show, langSettings ) );
			langSettings.$window.find( '#languagesettings-close' )
				.on( 'click', $.proxy( langSettings.hide, langSettings ) );

		},

		render: function () {
			var modules, defaultModule, moduleName;

			// Get the name of all registered modules and list them in left side menu.
			modules = $.fn.languagesettings.modules;
			defaultModule = this.options.defaultModule;
			for ( moduleName in modules ) {
				if ( modules.hasOwnProperty( moduleName ) ) {
					if ( !defaultModule ) {
						defaultModule = moduleName;
					}
					// Call render function on the current setting module.
					this.renderModule( moduleName, defaultModule === moduleName );
				}
			}
		},

		/**
		 * Render the link and settings area for a language setting module.
		 * @param moduleName String Name of the setting module
		 * @param active boolean Make this module active and show by default
		 */
		renderModule: function ( moduleName, active ) {
			var $settingsMenuItems, module, $settingsText, $settingsTitle, $settingsLink;

			$settingsMenuItems = this.$window.find( '.settings-menu-items' );
			module = new $.fn.languagesettings.modules[moduleName]( this );
			$settingsTitle = $( '<div>' )
				.addClass( 'settings-title' )
				.text( module.name );
			$settingsText = $( '<span>' )
				.addClass( 'settings-text' )
				.text( module.description );
			$settingsLink = $( '<div>' )
				.addClass( moduleName + '-settings-block menu-section' )
				.prop( 'id', moduleName + '-settings-block' )
				.data( 'module', module )
				.append( $settingsTitle )
				.append( $settingsText );

			$settingsMenuItems.append( $settingsLink );

			$settingsLink.on( 'click', function () {
				var module = $( this ).data( 'module' );
				module.render();
				$settingsMenuItems.find( '.menu-section' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
			} );

			if ( active ) {
				module.render();
				$settingsLink.addClass( 'active' );
			}
		},

		show: function () {
			if ( !this.initialized ) {
				var top, pos, left;

				this.render();
				this.initialized = true;
				pos = $.extend( {}, this.$element.offset(), {
					height: this.$element[0].offsetHeight
				} );
				top = this.top || pos.top + pos.height;
				left = this.left || '25%';
				// FIXME this is not exactly correct. position may not
				// be relative to the trigger.
				this.$window.css( {
					top: top,
					left: left
				} );
			}

			this.$window.i18n();
			this.shown = true;
			this.$window.show();
		},

		/**
		 * Hide this window.
		 * Will be used when moving to a different context and
		 * need coming back.
		 */
		hide: function () {
			this.shown = false;
			this.$window.hide();
		},

		/**
		 * Close this language settings window, and
		 * call onClose if defined from the previous context.
		 */
		close: function () {
			this.hide();
			if ( this.options.onClose ) {
				this.options.onClose();
			}
		},

		click: function () {
			if ( !this.shown ) {
				this.show();
			}
		}
	};

	$.fn.languagesettings = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'languagesettings' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'languagesettings', ( data = new LanguageSettings( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.languagesettings.modules = {};
	$.fn.languagesettings.defaults = {
		template: windowTemplate,
		defaultModule: false, // Name of the default module
		onClose: null, // An onClose event handler.
		top: null, // Top position of this window
		left: null // Left position of this window
	};

	$.fn.languagesettings.Constructor = LanguageSettings;

}( jQuery ) );
