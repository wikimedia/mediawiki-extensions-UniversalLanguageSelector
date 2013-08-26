# encoding: utf-8

Given(/^I am on a wiki in Kotava language$/) do
  visit(RandomPage)
  # Fake a Kotava Wiki
  @browser.execute_script( "mw.config.set( 'wgContentLanguage', 'avk' )" )
end

When(/^I click on an input box$/) do
  on(RandomPage) do |page|
    page.search_input_element.click
    # For some reason click alone doesn't seem to trigger the ime indicator
    # when running tests
    page.search_input_element.send_keys ' '
  end
end

When(/^I click on the input method indicator$/) do
  on(RandomPage).input_method_element.click
end

When(/^I open the input method menu$/) do
  on(RandomPage) do |page|
    page.search_input_element.click
    page.search_input_element.send_keys ' '
    page.input_method_element.click
  end
end

Then(/^I should see the input method indicator$/) do
  on(RandomPage).input_method_element.should be_visible
end

Then(/^I should see input methods for (.+)/) do |language|
  on(RandomPage).input_method_ime_list_title.should == language
end

Then(/^I should see a list of available input methods$/) do
  on(RandomPage).input_method_selector_menu_element.should be_visible
end

Then(/^I should see a list of suggested languages$/) do
  on(RandomPage).input_method_language_list_element.should be_visible
end

When(/^I choose (.+?) as the input language$/) do |language|
  on(RandomPage) do |page|
    page.more_languages
    page.language_filter = language
    page.language_filter_element.send_keys :return
  end
end

When(/^I click on the Malayalam InScript 2 menu item$/) do
  on(RandomPage).uls_malayalam_inscript2_item_element.click
end

When(/^I press Control\-M$/) do
  on(RandomPage).search_input_element.send_keys [:control, 'm']
end

When(/^I go to another random page$/) do
  visit(RandomPage)
end

Then(/^in it there must be an element with Malayalam text$/) do
  # 'input_method_enabled' alone only returns []
  on(RandomPage).input_method_enabled_element.text.should == 'ഇൻസ്ക്രിപ്റ്റ് 2'
end
