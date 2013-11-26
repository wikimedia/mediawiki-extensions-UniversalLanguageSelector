class PreferencesPage
	include PageObject

	include URL
	page_url URL.url("Special:Preferences")

	select(:set_interface_language, id: "mw-input-wplanguage")
	button(:save, id: "prefcontrol")

	a(:editing_tab, id: "preftab-editing")
	select(:editing_font, id: "mw-input-wpeditfont")
end
