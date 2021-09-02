( function () {
	'use strict';

	function ActionsMenuItemsRegistry() {
		ActionsMenuItemsRegistry.super.apply( this, arguments );
	}

	OO.inheritClass( ActionsMenuItemsRegistry, OO.Registry );

	ActionsMenuItemsRegistry.prototype.size = function () {
		return Object.keys( this.registry ).length;
	};

	ActionsMenuItemsRegistry.prototype.getItems = function () {
		var registry = this.registry;
		return Object.keys( registry ).map( function ( key ) {
			return registry[ key ];
		} );
	};

	/**
	 * Register an action item with the factory.
	 * Actions items are required to include all necessary properties,
	 * i.e. name, icon, text and handler function.
	 *
	 * @param {{name: string, icon: string, text: string, handler: Function}} item
	 */
	ActionsMenuItemsRegistry.prototype.register = function ( item ) {
		// Parent method
		ActionsMenuItemsRegistry.super.prototype.register.call( this, item.name, item );
	};

	mw.uls = mw.uls || {};
	mw.uls.ActionsMenuItemsRegistry = new ActionsMenuItemsRegistry();
}() );
