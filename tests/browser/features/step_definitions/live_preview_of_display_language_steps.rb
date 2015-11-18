When(/^I set English font to System$/) do
  on(PanelPage).select_font_for_content = 'System font'
end

When(/^I set English font to OpenDyslexic$/) do
  on(PanelPage).select_font_for_content = 'OpenDyslexic'
end

Then(/^the selected content font must be OpenDyslexic$/) do
  on(PanelPage).select_font_for_content.should == 'OpenDyslexic'
end

Given(/^I select a language different than English for display language$/) do
  on(PanelPage).other_language_button_element.click
end

When(/^I click on the link to select Malayalam$/) do
  on(MainPage).malayalam_element.click
end

Then(/^I should see the text in the language panel in (.+?)$/) do |language|
  code = on(PanelPage).language_to_code(language)
  on(PanelPage).uls_display_settings_element.attribute('lang').should == code
end
