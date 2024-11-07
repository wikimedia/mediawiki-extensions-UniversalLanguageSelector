( function () {
	const ActionsMenuItem = function ( icon, text, handler, href ) {
		this.icon = icon;
		this.text = text;
		this.handler = handler;
		this.href = href;
	};

	/**
	 * @return {OO.ui.ButtonWidget}
	 */
	ActionsMenuItem.prototype.render = function () {
		const actionButtonOptions = {
			framed: false,
			icon: this.icon,
			label: this.text,
			classes: [ 'uls-language-action' ],
			flags: [ 'progressive' ]
		};

		if ( this.href ) {
			actionButtonOptions.href = this.href;
		}

		const actionButton = new OO.ui.ButtonWidget( actionButtonOptions );

		if ( !this.href ) {
			actionButton.$element.one( 'click', this.handler );
		}

		return actionButton;
	};

	module.exports = ActionsMenuItem;
}() );
