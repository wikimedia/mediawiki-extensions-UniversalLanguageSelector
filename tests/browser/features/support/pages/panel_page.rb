class ULSPage
  include PageObject

  include URL
  page_url URL.url('?setlang=<%=params[:setlang]%>')

	div(:panel_display, id: 'display-settings-block')
	div(:panel_input, id: 'display-settings-block')
	button(:panel_fonts, id: 'uls-display-settings-fonts-tab')
	button(:panel_language, id: 'uls-display-settings-language-tab')

	span(:panel_button_close, id: 'languagesettings-close')
	button(:panel_button_display_apply, id: 'uls-displaysettings-apply')
end
