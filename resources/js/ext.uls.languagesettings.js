/*!
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
		'<div class="uls-language-settings-close-block eight columns offset-by-four"><span id="languagesettings-close" class="uls-icon-close"></span></div>' +
		'</div>';
	settingsMenu = '<div class="four columns languagesettings-menu">' +
		'<h1 data-i18n="ext-uls-language-settings-title"></h1>' +
		'<div class="settings-menu-items">' +
		'</div>' +
		'</div>';
	settingsPanel = '<div id="languagesettings-settings-panel" class="eight columns">' +
		'</div>';
	// Apply and Cancel buttons
	buttonsRow = '<div class="row language-settings-buttons">' +
		'<div class="eleven columns">' +
		'<button class="mw-ui-button uls-settings-cancel" data-i18n="ext-uls-language-settings-cancel"></button>' +
		'<button class="mw-ui-button mw-ui-progressive active uls-settings-apply" data-i18n="ext-uls-language-settings-apply" disabled></button>' +
		'</div>' +
		'</div>' +
		'</div>';
	panelsRow = '<div class="row" id="languagesettings-panels">' +
		settingsMenu +
		settingsPanel +
		'</div>';
	windowTemplate = '<div style="display: block;" id="language-settings-dialog" class="grid uls-menu uls-wide">' +
		closeRow +
		panelsRow +
		buttonsRow +
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
		 *
		 * @param {string} moduleName Name of the setting module
		 * @param {boolean} active boolean Make this module active and show by default
		 */
		initModule: function ( moduleName, active ) {
			var $settingsTitle, $settingsText, $settingsLink,
				languageSettings = this,
				module = new $.fn.languagesettings.modules[ moduleName ]( languageSettings ),
				$settingsMenuItems = languageSettings.$window.find( '.settings-menu-items' );

			$settingsTitle = $( '<div>' )
				.addClass( 'settings-title' )
				.attr( 'data-i18n', module.nameI18n );
			$settingsText = $( '<span>' )
				.addClass( 'settings-text' )
				.attr( 'data-i18n', module.descriptionI18n );
			$settingsLink = $( '<div>' )
				.addClass( moduleName + '-settings-block menu-section' )
				.prop( 'id', moduleName + '-panel-trigger' )
				.data( 'module', module )
				.append(
					$settingsTitle,
					$settingsText
				);

			if ( active ) {
				$settingsLink.addClass( 'active' );
			}

			$settingsMenuItems.append( $settingsLink );

			$settingsLink.on( 'click', function () {
				var $this = $( this );

				$this.data( 'module' ).render();
				languageSettings.$window.scrollIntoView();
				$settingsMenuItems.find( '.menu-section' ).removeClass( 'active' );
				$this.addClass( 'active' );
			} );

			this.modules[ moduleName ] = module;

			// Register cancel and apply hooks
			mw.hook( 'mw.uls.settings.cancel' ).add( $.proxy( module.cancel, module ) );
			mw.hook( 'mw.uls.settings.apply' ).add( $.proxy( module.apply, module ) );
		},

		position: function () {
			this.top = this.top || this.$element.offset().top + this.$element.outerHeight();
			this.left = this.left || '25%';
			this.$window.css( {
				top: this.top,
				left: this.left
			} );
		},

		i18n: function () {
			this.$window.i18n();
		},

		show: function () {
			this.position();

			if ( !this.initialized ) {
				this.render();
				this.initialized = true;
			}
			// Close other modal windows which listen to click events outside them
			$( 'html' ).click();
			this.i18n();
			// Every time we show this window, make sure the current
			// settings panels is up-to-date. So just click on active menu item.
			this.$window.find( '.settings-menu-items > .active' ).click();

			this.shown = true;
			this.$window.show();
			this.visible();
			this.$window.scrollIntoView();
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
		 * Put the language settings panel in busy mode.
		 * Busy mode means displaying a progress cursor,
		 * and showing the 'apply' button as disabled and with
		 * a different label.
		 *
		 * @param {boolean} busy set true to put the panel in busy mode,
		 *     false to unset the busy mode.
		 */
		setBusy: function ( busy ) {
			var $applyButton = this.$window.find( 'button.uls-settings-apply' );

			if ( busy ) {
				this.$window.addClass( 'waiting' );
				$applyButton
					.text( $.i18n( 'ext-uls-language-settings-applying' ) )
					.prop( 'disabled', true );
			} else {
				this.$window.removeClass( 'waiting' );
				$applyButton.text( $.i18n( 'ext-uls-language-settings-apply' ) );
			}
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
		},

		disableApplyButton: function () {
			this.$window.find( 'button.uls-settings-apply' ).prop( 'disabled', true );
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
				data[ option ]();
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
