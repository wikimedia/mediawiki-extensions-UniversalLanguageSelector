Given(/^I set interface language that is different from content language and has a font$/) do
	visit(PreferencesPage) do |page|
		page.set_interface_language_element.select_value 'de'
		page.save_element.click
	end
end

When(/^I select a font for the interface language$/) do
	on(PanelPage).select_font_for_interface = 'OpenDyslexic'
end

Then(/^the selected interface font must be what I previously selected$/) do
	on(PanelPage).select_font_for_interface.should == 'OpenDyslexic'
end

When(/^I set English font to System$/) do
	on(PanelPage).select_font_for_content = 'System font'
end

And(/^I set English font to OpenDyslexic$/) do
	on(PanelPage).select_font_for_content = 'OpenDyslexic'
end

Then(/^the selected content font must be OpenDyslexic$/) do
	on(PanelPage).select_font_for_content.should == 'OpenDyslexic'
end

And(/^I select a language different than English for display language$/) do
	on(PanelPage).other_language_button_element.click
end

And(/^I click on the link to select Hindi$/) do
	on(InterlanguagePage).hindi_link_element.click
end

Then(/^I should see the text in the language panel in (.+?)$/) do |language|
	code = on(PanelPage).language_to_code(language)
	on(PanelPage).uls_display_settings_element.attribute('lang').should == code
end
