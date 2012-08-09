/**
 * ULS-based display settings panel
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
	var template = '<div><h3>Display Settings</h3></div>' +
		'<div><h4>Select Language</h4></div>' +
		'<div>' +
			'<button>English</button>' +
			'<button>Deutsch</button>' +
			'<button>עברית</button>' +
			'<button class="uls-trigger">...</button>' +
		'</div>' +
		'<div><h4>Font Settings</h4></div>' +
		'<div>' +
			'<input type="checkbox" id="webfonts-enable-checkbox" />' +
			'<label for="webfonts-enable-checkbox">Download fonts automatically when needed</label>' +
		'</div>' +
		'<div><h5>Select your preferred fonts to use</h5></div>' +
		'<div>Fonts for English<select></select></div>' +
		'<div>Fonts for Spanish<select></select></div>' +
		'<div class="language-settings-buttons"><button>Cancel</button><button>Apply changes</button></div>';

	var displaySettings = {
		render: function() {
			return template;
		},
		name: "Display",
		description: "Set the fonts for languages"
	};

	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: displaySettings
	} );
} ) ( jQuery );
