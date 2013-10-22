class PanelPage
	include PageObject

	include URL
	page_url URL.url('?<%=params[:extra]%>')

	div(:uls, class: 'uls-menu')
	span(:uls_button_close, id: 'uls-close')

	div(:language_settings_dialog, id: 'language-settings-dialog')
	div(:panel_display, id: 'display-settings-block')
	div(:panel_input, id: 'input-settings-block')
	button(:panel_fonts, id: 'uls-display-settings-fonts-tab')
	button(:panel_language, id: 'uls-display-settings-language-tab')

	span(:panel_button_close, id: 'languagesettings-close')
	button(:panel_button_apply, class: 'uls-settings-apply')
	button(:panel_button_cancel, class: 'uls-settings-cancel')

	button(:panel_disable_input_methods, class: 'uls-input-toggle-button')
	button(:panel_enable_input_methods, class: 'uls-input-toggle-button')

	select_list(:panel_content_font_selector, id: 'content-font-selector')
	select_list(:panel_interface_font_selector, id: 'ui-font-selector')

	# TODO: Rename to match convention
	button(:other_language_button, class: 'button uls-language-button', index: 1)
	button(:default_language_button, class: 'button uls-language-button down')

	# Triggers
	span(:trigger_cog, class: 'uls-settings-trigger')
	a(:trigger_personal, class: 'uls-trigger')

	select(:select_font_for_interface, id: 'ui-font-selector')
	select(:select_font_for_content, id: 'content-font-selector')

	div(:uls_display_settings, class: 'uls-display-settings')

	# Is there way to access the html element?
	div(:interface, id: 'footer')

	def get_content_font
		get_font('#mw-content-text')
	end
	def get_font(selector)
		@browser.execute_script( "return $( '#{selector}' ).css( 'font-family' );" )
	end
	def get_interface_font
		get_font('body')
	end
	def language_to_code(language)
		case language
			when 'German'
				'de'
			when 'English'
				'en'
			when 'Finnish'
				'fi'
			when 'Hebrew'
				'he'
			when 'Hindi'
				'hi'
			else
				pending
		end
	end
end
