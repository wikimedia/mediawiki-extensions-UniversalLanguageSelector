( function () {
	var ActionsMenuItem = function ( icon, text, handler ) {
		this.icon = icon;
		this.text = text;
		this.handler = handler;
	};

	ActionsMenuItem.prototype.render = function () {
		return new OO.ui.ButtonWidget( {
			framed: false,
			icon: this.icon,
			label: this.text,
			classes: [ 'uls-language-action' ],
			flags: [ 'progressive' ]
		} );
	};

	module.exports = ActionsMenuItem;
}() );
