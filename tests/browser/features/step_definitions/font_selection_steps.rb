When(/^I click the checkbox to (?:enable|disable) fonts downloading$/) do
  on(PanelPage).webfonts_enable_checkbox_element.click
end

Then(/^the checkbox to enable fonts downloading appears$/) do
  on(PanelPage).webfonts_enable_checkbox_element.should be_visible
end

Then(/^the checkbox to enable fonts downloading is checked$/) do
  on(PanelPage).webfonts_enable_checkbox_element.should be_checked
end

Then(/^the checkbox to enable fonts downloading is not checked$/) do
  on(PanelPage).webfonts_enable_checkbox_element.should_not be_checked
end

Given(/^I open ULS$/) do
  on(PanelPage).trigger_personal_element.when_visible.click
end

Then(/^the active content font must be the same as font prior to the preview$/) do
  on(PanelPage).content_font.should == @original_content_font
end

Then(/^the active interface font must be the same as font prior to the preview$/) do
  on(PanelPage).interface_font.should == @original_interface_font
end

Then(/^the selected content font must be (.*?)$/) do |font|
  on(PanelPage).selected_content_font_element.when_visible.value.should == font
end

Then(/^the interface font is (.*?)$/) do |font|
  on(PanelPage).interface_font.should match("^#{font}")
end

Then(/^the content font is (.*?)$/) do |font|
  on(PanelPage).content_font.should match("^#{font}")
end

Then(/^webfonts are applied to body$/) do
  on(PanelPage).webfonts_library_loaded.should be_true
end

Then(/^webfonts are not applied to body$/) do
  on(PanelPage).webfonts_library_loaded.should be_false
end
