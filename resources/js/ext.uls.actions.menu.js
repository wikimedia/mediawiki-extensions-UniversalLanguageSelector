( function () {
	'use strict';

	const ActionsMenuItem = require( './ext.uls.actions.menu.item.js' );

	function ActionsMenu( options ) {
		this.options = options;
		this.$template = $( ActionsMenu.template );
		this.actionItems = options.actions.map(
			( action ) => new ActionsMenuItem(
				action.icon, action.text, action.handler, action.href
			)
		);
		this.rendered = false;
		this.shown = false;
	}

	ActionsMenu.template = '<div class="uls-menu uls-language-actions-dialog notheme skin-invert">' +
			'<div class="uls-language-actions-title">' +
				'<button class="cdx-button cdx-button--weight-quiet uls-language-actions-close"></button>' +
				'<span> <strong></strong> </span>' +
			'</div>' +
			'<div class="uls-language-action-items"></div>' +
		'</div>';

	ActionsMenu.prototype = {

		/**
		 * Render the module into a given target
		 */
		render: function () {
			if ( this.rendered ) {
				this.shown = true;
				this.$template.show();
				return;
			}
			this.actionItems.forEach( ( actionItem ) => {
				this.renderAction( actionItem );
			} );

			this.i18n();
			$( document.body ).append( this.$template );
			this.$template.css( this.position() );
			this.$template.show();
			this.$template.find( '.uls-language-actions-close' ).on( 'click', ( event ) => {
				event.stopPropagation();
				this.close();
			} );

			$( document.body ).on( 'click', this.cancel.bind( this ) );

			this.shown = true;
			this.rendered = true;
		},

		position: function () {
			if ( this.options.onPosition ) {
				return this.options.onPosition.call( this );
			}
		},

		/**
		 * @param {ActionsMenuItem | Object} actionItem
		 */
		renderAction: function ( actionItem ) {
			if ( !( actionItem instanceof ActionsMenuItem ) ) {
				actionItem = new ActionsMenuItem(
					actionItem.icon,
					actionItem.text,
					actionItem.handler,
					actionItem.href
				);
			}
			const actionButton = actionItem.render();
			this.$template.find( '.uls-language-action-items' ).prepend(
				actionButton.$element
			);
		},

		i18n: function () {
			this.$template.find( '.uls-language-actions-title strong' )
				.text( $.i18n( 'ext-uls-add-languages-button-label' ) );
		},

		hide: function () {
			this.shown = false;
			this.$template.hide();
		},

		cancel: function ( e ) {
			if ( e && ( this.$template.is( e.target ) ||
					$.contains( this.$template[ 0 ], e.target ) ) ) {
				return;
			}

			this.hide();
		},

		close: function () {
			if ( !this.shown ) {
				return;
			}

			this.hide();
			// optional callback
			if ( this.options.onClose ) {
				this.options.onClose();
			}

		}
	};

	module.exports = ActionsMenu;

}() );
