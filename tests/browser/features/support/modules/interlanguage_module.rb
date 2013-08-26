require "page-object"

module InterlanguagePageModule
  include PageObject

  a(:add_links, id: 'wbc-linkToItem-link')
  span(:apply_settings, class: 'uls-settings-trigger')
  a(:back_to_display, text: 'Back to display settings')
  a(:back_to_input, text: 'Back to input settings')
  button(:cancel, class: 'button uls-display-settings-cancel')
  span(:cog, class: 'uls-settings-trigger')
  select_list(:content_font_selectbox, id: 'content-font-selector')
  button(:default_language_button, class: 'button uls-language-button down')
  button(:disable_input_methods, class: 'active green button uls-input-toggle-button')
  button(:ellipsis_button, class: 'uls-more-languages button')
  button(:enable_input, class: 'active green button uls-input-toggle-button')
  a(:english_link, text: 'English')
  button(:fonts_button, id: 'uls-display-settings-fonts-tab')
  button(:fonts_settings, id: 'uls-display-settings-fonts-tab')
  div(:input_settings, id: 'input-settings-block')
  button(:language_button, id: 'uls-display-settings-language-tab')
  div(:language_list, class: 'row uls-language-list lcd')
  text_field(:language_search, id: 'languagefilter')
  button(:non_default_language, class: 'button uls-language-button', index: 1)
  button(:other_language_button, class: 'button uls-language-button')
  a(:talk, text: 'Discussion')
  select_list(:ui_font_selectbox, id: 'ui-font-selector')
  span(:x, id: 'languagesettings-close')
  a(:how_to_use_ml_transliteration, href: 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:UniversalLanguageSelector/Input_methods/ml-transliteration')
end
