class IMEPage
	include PageObject

	div(:input_method, class: 'imeselector imeselector-toggle')
	h3(:input_method_ime_list_title, class: 'ime-list-title')
	ul(:input_method_language_list, class: 'ime-language-list')
	div(:input_method_selector_menu, class: 'imeselector-menu')
	text_field(:search_input, id: 'searchInput')
end
