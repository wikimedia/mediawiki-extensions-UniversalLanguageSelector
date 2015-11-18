Given(/^I am at the main page$/) do
  visit MainPage
end

Given(/^I am logged out$/) do
end

Given(/^I set "(.*?)" as the interface language$/) do |language|
  code = on(PanelPage).language_to_code(language)
  visit(PanelPage, using_params: { extra: "setlang=#{code}" })
  @original_content_font = on(PanelPage).content_font
  @original_interface_font = on(PanelPage).interface_font
end

Given(/^I temporarily use "(.*?)" as the interface language$/) do |language|
  code = on(PanelPage).language_to_code(language)
  visit(PanelPage, using_params: { extra: "uselang=#{code}" })
end

Then(/^my interface language is "(.*?)"$/) do |language|
  code = on(PanelPage).language_to_code(language)
  on(PanelPage).interface_element.attribute('lang').should == code
end

When(/^I click the button with the ellipsis$/) do
  on(InterlanguagePage).ellipsis_button_element.click
end

When(/^in the language filter I type (.+)$/) do |language_abbreviation|
  on(IMEPage).language_filter = language_abbreviation
end

When(/^I click Cancel$/) do
  on(PanelPage).panel_button_cancel_element.click
end

When(/^I click X$/) do
  on(InterlanguagePage).x_element.click
end
