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

( function ( $, mw ) {
	'use strict';

	var closeRow, settingsMenu, settingsPanel, windowTemplate, panelsRow, buttonsRow;

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
	buttonsRow = '<div class="row"></div>' +
		// Apply and Cancel buttons
		'<div class="row language-settings-buttons">' +
		'<div class="eleven columns">' +
		'<button class="button uls-settings-cancel" data-i18n="ext-uls-language-settings-cancel"></button>' +
		'<button class="button active blue uls-settings-apply" data-i18n="ext-uls-language-settings-apply" disabled></button>' +
		'</div>' +
		'</div>' +
		'</div>';
	panelsRow = '<div class="row" id="languagesettings-panels">' +
		settingsMenu +
		settingsPanel +
		buttonsRow +
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
		this.modules = {};
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

		// Register all event listeners to the ULS language settings here.
		listen: function () {
			this.$element.on( 'click', $.proxy( this.click, this ) );

			this.$window.find( '#languagesettings-close, button.uls-settings-cancel' )
				.on( 'click', $.proxy( mw.hook( 'mw.uls.settings.cancel' ).fire, this ) );
			this.$window.find( 'button.uls-settings-apply' )
				.on( 'click', $.proxy( mw.hook( 'mw.uls.settings.apply' ).fire, this ) );
			// Hide the window when clicked outside
			$( 'html' ).click( $.proxy( this.hide, this ) );

			// ... but when clicked on window do not hide.
			this.$window.on( 'click', function ( event ) {
				event.stopPropagation();
			} );
		},

		render: function () {
			var modules,
				languageSettings = this,
				defaultModule = this.options.defaultModule;

			// Get the name of all registered modules and list them in left side menu.
			// Sort the modules based on id
			modules = $.map( $.fn.languagesettings.modules, function ( element, index ) {
				return index;
			} ).sort();
			$.each( modules, function ( index, moduleName ) {
				if ( $.fn.languagesettings.modules.hasOwnProperty( moduleName ) ) {
					if ( !defaultModule ) {
						defaultModule = moduleName;
					}

					// Call render function on the current setting module.
					languageSettings.initModule( moduleName, defaultModule === moduleName );
				}
			} );
		},

		/**
		 * Initialize the module.
		 * Render the link and settings area for a language setting module.
		 * @param {string} moduleName Name of the setting module
		 * @param {boolean} active boolean Make this module active and show by default
		 */
		initModule: function ( moduleName, active ) {
			var $settingsTitle, $settingsText, $settingsLink,
				languageSettings = this,
				module = new $.fn.languagesettings.modules[moduleName]( languageSettings ),
				$settingsMenuItems = languageSettings.$window.find( '.settings-menu-items' );

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
				.append(
					$settingsTitle,
					$settingsText
				);

			$settingsMenuItems.append( $settingsLink );

			$settingsLink.on( 'click', function () {
				var $this = $( this );

				$this.data( 'module' ).render();
				// Re-position the window and scroll in to view if required.
				languageSettings.position();
				$settingsMenuItems.find( '.menu-section' ).removeClass( 'active' );
				$this.addClass( 'active' );
			} );

			if ( active ) {
				module.render();
				$settingsLink.addClass( 'active' );
			}
			this.modules[moduleName] = module;

			// Register cancel and apply hooks
			mw.hook( 'mw.uls.settings.cancel' ).add( $.proxy( module.cancel, module ) );
			mw.hook( 'mw.uls.settings.apply' ).add( $.proxy( module.apply, module ) );
		},

		position: function () {
			var top, pos, left;

			pos = $.extend( {}, this.$element.offset(), {
				height: this.$element[0].offsetHeight
			} );
			top = this.top || pos.top + pos.height;
			left = this.left || '25%';
			this.$window.css( {
				top: top,
				left: left
			} );
			this.$window.scrollIntoView();
		},

		i18n: function () {
			this.$window.i18n();
		},

		show: function () {
			if ( !this.initialized ) {
				this.render();
				this.initialized = true;
			}
			// close model windows close, if they hide on page click
			$( 'html' ).click();
			this.i18n();
			this.shown = true;
			this.$window.show();

			// Every time we show this window, make sure the current
			// settings panels is upto date. So just click on active menu item.
			this.$window.find( '.settings-menu-items > .active' ).click();
			this.position();
			this.visible();
		},

		/**
		 * A "hook" that runs after the ULS panel becomes visible
		 * by using the show method.
		 *
		 * To use it, pass a function as the onVisible parameter
		 * in the options when initializing ULS.
		 */
		visible: function () {
			if ( this.options.onVisible ) {
				this.options.onVisible.call( this );
			}
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
			if ( !this.shown ) {
				return;
			}

			this.hide();

			// optional callback
			if ( this.options.onClose ) {
				this.options.onClose();
			}

		},

		click: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			if ( this.shown ) {
				this.hide();
			} else {
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
		left: null, // Left position of this window
		onVisible: null // A callback that runs after the ULS panel becomes visible
	};

	$.fn.languagesettings.Constructor = LanguageSettings;
}( jQuery, mediaWiki ) );
