# encoding: utf-8

Given(/^I am on a wiki in Kotava language$/) do
  visit(RandomPage)
  # Fake a Kotava Wiki
  @browser.execute_script( "mw.config.set( 'wgContentLanguage', 'avk' )" )
end

When(/^I click on an input box$/) do
  on(IMEPage).search_input_element.click
end

When(/^I click on the input method indicator$/) do
  on(IMEPage).input_method_element.when_present.click
end

When(/^I open the input method menu$/) do
  step 'I click on an input box'
  on(IMEPage).input_method_element.when_present.click
end

Then(/^I should see the input method indicator$/) do
  on(IMEPage).input_method_element.when_present.should be_visible
end

Then(/^I should see input methods for (.+)/) do |language|
  on(IMEPage).input_method_ime_list_title.should == language
end

Then(/^I should see a list of available input methods$/) do
  on(IMEPage).input_method_selector_menu_element.should be_visible
end

Then(/^I should see a list of suggested languages$/) do
  on(IMEPage).input_method_language_list_element.should be_visible
end

When(/^I choose (.+?) as the input language$/) do |language|
  on(IMEPage) do |page|
    page.more_languages
    page.language_filter = language
    # firefox only works with :return
    # phantomjs only works with :enter
    # This seems to work on both
    page.language_filter_element.send_keys "\n"
  end
end

When(/^I click on the Malayalam InScript 2 menu item$/) do
  on(IMEPage).malayalam_inscript2_element.click
end

When(/^I press Control-M$/) do
  on(IMEPage).search_input_element.send_keys [:control, 'm']
end

When(/^I go to another random page$/) do
  visit(RandomPage)
end

Then(/^in it there must be an element with Malayalam text$/) do
  # 'input_method_enabled' alone only returns []
  on(IMEPage).input_method_enabled_element.text.should == 'ഇൻസ്ക്രിപ്റ്റ് 2'
end

When(/^I visit page in Vector skin$/) do
  visit(PanelPage, :using_params => {:extra => "useskin=vector"})
end

When(/^I visit page in Monobook skin$/) do
  visit(PanelPage, :using_params => {:extra => "useskin=monobook"})
end

Then(/^I should see the input method menu is not offscreen$/) do
  @browser.execute_script( "
    var $selectorMenu = $( '.imeselector-menu' ),
        menuLeft = $selectorMenu.offset().left,
        menuRight = menuLeft + $selectorMenu.width();

    return ( menuLeft >= 0 && menuRight <= $( window ).width() );
  " ).should == true
end
