class PanelPage
  include PageObject
  include LanguageModule

  page_url '?<%=params[:extra]%>'

  div(:uls, class: 'uls-menu')
  span(:uls_button_close, id: 'uls-close')

  div(:language_settings_dialog, id: 'language-settings-dialog')
  div(:panel_display, id: 'display-settings-block')
  button(:panel_fonts, id: 'uls-display-settings-fonts-tab')
  button(:panel_language, id: 'uls-display-settings-language-tab')

  div(:panel_side_display, id: 'display-panel-trigger')
  div(:panel_side_input, id: 'input-panel-trigger')

  span(:panel_button_close, id: 'languagesettings-close')
  button(:panel_button_apply, class: 'uls-settings-apply')
  button(:panel_button_cancel, class: 'uls-settings-cancel')

  button(:panel_disable_input_methods, class: 'uls-input-toggle-button')
  button(:panel_enable_input_methods, class: 'uls-input-toggle-button')

  checkbox(:webfonts_enable_checkbox, id: 'webfonts-enable-checkbox')

  select_list(:panel_content_font_selector, id: 'content-font-selector')
  select_list(:panel_interface_font_selector, id: 'ui-font-selector')

  button(:other_language_button, class: 'button uls-language-button', index: 1)
  button(:default_language_button, css: '.uls-language-button.down')

  # Triggers
  span(:trigger_cog, class: 'uls-settings-trigger')
  a(:trigger_personal, class: 'uls-trigger')

  select(:selected_content_font, id: 'content-font-selector')
  select(:selected_interface_font, id: 'ui-font-selector')

  select(:font_for_content, id: 'content-font-selector')

  div(:uls_display_settings, class: 'uls-display-settings')

  radio_button(:ml_inscript2_radio, id: 'ml-inscript2')

  # Is there way to access the html element?
  div(:interface, id: 'footer')

  def uls_language_name_item(language)
    browser.element(css: ".uls-language-block li[lang=#{language}] a")
  end

  def content_font
    font('#mw-content-text')
  end

  def interface_font
    font('body')
  end

  def uls_onscreen?
    browser.execute_script("
      var $menu = $( '.uls-menu' ),
        $window = $( window ),
        top = $menu.offset().top,
        viewportTop = $window.scrollTop(),
        viewportBottom = $window.scrollTop() + $window.height();

      return ( top < viewportBottom && top >= viewportTop )")
  end

  def webfonts_library_loaded
    browser.execute_script("return ( $( 'body' ).data( 'webfonts' ) !== undefined )")
  end

  private
  def font(selector)
    browser.execute_script("return $( '#{selector}' ).css( 'font-family' );")
  end
end
