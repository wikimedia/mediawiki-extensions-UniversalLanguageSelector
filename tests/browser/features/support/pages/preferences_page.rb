class PreferencesPage
	include PageObject

	include URL
	page_url URL.url('Special:Preferences')

	select(:set_interface_language, id: 'mw-input-wplanguage')
	button(:save, id: 'prefcontrol')

	a(:preftab_editing, id: 'preftab-editing')
	select(:pref_editfont, id: 'mw-input-wpeditfont')
end
