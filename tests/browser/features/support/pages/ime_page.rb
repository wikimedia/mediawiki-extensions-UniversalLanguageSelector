class IMEPage
  include PageObject
  include LanguageModule

  page_url '?<%=params[:extra]%>'

  div(:input_method, class: 'imeselector imeselector-toggle')
  a(:input_method_enabled, class: 'ime-name imeselector-toggle')
  h3(:input_method_ime_list_title, class: 'ime-list-title')
  ul(:input_method_language_list, class: 'ime-language-list')
  div(:input_method_selector_menu, class: 'imeselector-menu')
  text_field(:language_filter, id: 'uls-languagefilter')
  li(:malayalam_inscript2, data_ime_inputmethod: 'ml-inscript2')
  a(:more_languages, class: 'ime-selector-more-languages')
  text_field(:search_input, id: 'searchInput')

  def ime_input_method_menu_onscreen?
    browser.execute_script("
      var $selectorMenu = $( '.imeselector-menu' ),
        menuLeft = $selectorMenu.offset().left,
        menuRight = menuLeft + $selectorMenu.width();

      return ( menuLeft >= 0 && menuRight <= $( window ).width() );")
  end
end
