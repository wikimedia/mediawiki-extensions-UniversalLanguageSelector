Given(/^I set interface language that is different from content language and has a font$/) do
	visit(PreferencesPage) do |page|
		page.set_interface_language_element.select_value 'de'
		page.save_element.click
	end
end

When(/^I select a font for the interface language$/) do
	on(ULSPage).select_font_for_interface = 'OpenDyslexic'
end

Then(/^the selected interface font must be what I previously selected$/) do
	on(ULSPage).select_font_for_interface.should == 'OpenDyslexic'
end
