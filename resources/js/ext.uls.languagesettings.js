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

( function () {
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
	buttonsRow = '<div class="row collapse language-settings-buttons">' +
		'<div class="twelve columns">' +
		'<button class="mw-ui-button uls-settings-cancel" data-i18n="ext-uls-language-settings-cancel"></button>' +
		'<button class="mw-ui-button mw-ui-progressive active uls-settings-apply" data-i18n="ext-uls-language-settings-apply" disabled></button>' +
		'</div>' +
		'</div>' +
		'</div>';
	panelsRow = '<div class="row" id="languagesettings-panels">' +
		settingsMenu +
		settingsPanel +
		'</div>';
	windowTemplate = '<div style="display: block;" id="language-settings-dialog" class="language-settings-dialog grid uls-menu uls-wide">' +
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
		this.$applyButton = this.$window.find( '.uls-settings-apply' );
		this.init();
		this.listen();

		if ( options.autoOpen ) {
			this.show();
		}
	}

	LanguageSettings.prototype = {
		constructor: LanguageSettings,

		init: function () {
			$( document.body ).append( this.$window );
			this.hide();
		},

		// Register all event listeners to the ULS language settings here.
		listen: function () {
			this.$element.on( 'click', this.click.bind( this ) );

			this.$window.find( '#languagesettings-close, button.uls-settings-cancel' )
				.on( 'click', mw.hook( 'mw.uls.settings.cancel' ).fire.bind( this ) );
			this.$applyButton
				.on( 'click', mw.hook( 'mw.uls.settings.apply' ).fire.bind( this ) );
			// Hide the window when clicked outside
			$( document.documentElement ).on( 'click', this.hide.bind( this ) );

			// ... but when clicked on window do not hide.
			this.$window.on( 'click', function ( event ) {
				event.stopPropagation();
			} );

			// Map Escape to same action as the close button. This is keyup (and not keydown)
			// because ULS also listens to keyup and we need to stop propagation.
			this.$window.on( 'keyup', function ( event ) {
				if ( event.which === 27 ) {
					event.stopPropagation();
					mw.hook( 'mw.uls.settings.cancel' ).fire();
				}
			} );
		},

		render: function () {
			var modules,
				languageSettings = this,
				defaultModule = this.options.defaultModule;

			// Get the name of all registered modules and list them in left side menu.
			// Sort the modules based on id
			modules = Object.keys( $.fn.languagesettings.modules ).sort();
			modules.forEach( function ( moduleName ) {
				if ( !defaultModule ) {
					defaultModule = moduleName;
				}

				// Call render function on the current setting module.
				languageSettings.initModule( moduleName, defaultModule === moduleName );
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
			$settingsLink = $( '<button>' )
				// The following classes are used here:
				// * display-settings-block
				// * input-settings-block
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
				// eslint-disable-next-line no-jquery/no-sizzle
				if ( languageSettings.$window.is( ':visible' ) ) {
					languageSettings.$window.scrollIntoView();
				}
				$settingsMenuItems.find( '.menu-section' ).removeClass( 'active' );
				$this.addClass( 'active' );
			} );

			this.modules[ moduleName ] = module;

			// Register cancel and apply hooks
			mw.hook( 'mw.uls.settings.cancel' ).add( module.cancel.bind( module ) );
			mw.hook( 'mw.uls.settings.apply' ).add( module.apply.bind( module ) );
		},

		position: function () {
			if ( this.options.onPosition ) {
				return this.options.onPosition.call( this );
			}

			this.top = this.top || this.$element.offset().top + this.$element.outerHeight();
			this.left = this.left || '25%';
			return {
				top: this.top,
				left: this.left
			};
		},

		i18n: function () {
			this.$window.i18n();
		},

		show: function () {
			this.$window.css( this.position() );

			if ( !this.initialized ) {
				this.render();
				this.initialized = true;
			}
			// Close other modal windows which listen to click events outside them
			$( document.documentElement ).trigger( 'click' );
			this.i18n();
			// Every time we show this window, make sure the current
			// settings panels is up-to-date. So just click on active menu item.
			this.$window.find( '.settings-menu-items > .active' ).trigger( 'click' );

			this.shown = true;
			this.$window.show();
			this.visible();
			this.$window.scrollIntoView();
			// For keyboard navigation, put the focus on an element inside the dialog
			this.$window.find( '.menu-section.active' ).trigger( 'focus' );
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
			if ( busy ) {
				this.$window.addClass( 'waiting' );
				this.$applyButton
					.text( $.i18n( 'ext-uls-language-settings-applying' ) )
					.prop( 'disabled', true );
			} else {
				this.$window.removeClass( 'waiting' );
				this.$applyButton.text( $.i18n( 'ext-uls-language-settings-apply' ) );
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

		enableApplyButton: function () {
			this.$applyButton.prop( 'disabled', false );
		},

		disableApplyButton: function () {
			this.$applyButton.prop( 'disabled', true );
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
		top: null, // DEPRECATED: Top position of this window
		left: null, // DEPRECATED: Left position of this window
		onVisible: null, // A callback that runs after the ULS panel becomes visible
		onPosition: null, // A callback that allows positioning the dialog,
		autoOpen: false // A boolean that determines if dialog should auto-open after initialization
	};

	$.fn.languagesettings.Constructor = LanguageSettings;

}() );
