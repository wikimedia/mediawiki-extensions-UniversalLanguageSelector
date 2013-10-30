class IMEPage
	include PageObject

	div(:input_method, class: 'imeselector imeselector-toggle')
	a(:input_method_enabled, class: 'ime-name imeselector-toggle')
	h3(:input_method_ime_list_title, class: 'ime-list-title')
	ul(:input_method_language_list, class: 'ime-language-list')
	div(:input_method_selector_menu, class: 'imeselector-menu')
	text_field(:language_filter, id: 'languagefilter')
	li(:malayalam_inscript2, data_ime_inputmethod: 'ml-inscript2')
	a(:more_languages, class: 'ime-selector-more-languages')
	text_field(:search_input, id: 'searchInput')
end
