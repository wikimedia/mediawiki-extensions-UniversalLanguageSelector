Given(/^I open ULS$/) do
	on(PanelPage).trigger_personal_element.when_visible.click
end

Given(/^I open display settings$/) do
	on(PanelPage).panel_display_element.when_visible.click
end

When(/^I open fonts panel of language settings$/) do
	on(PanelPage).panel_fonts_element.click
end

Then(/^the active content font must be the same as font prior to the preview$/) do
	pending('bug #56081') do
		on(PanelPage).content_font.should == @original_content_font
	end
end

Then(/^the active interface font must be the same as font prior to the preview$/) do
	on(PanelPage).interface_font.should == @original_interface_font
end

Then(/^the selected content font must be "(.*?)"$/) do |font|
	step 'I open display settings'
	step 'I open fonts panel of language settings'
	on(PanelPage).selected_content_font.should == font
end

Then(/^the selected interface font must be "(.*?)"$/) do |font|
	step 'I open display settings'
	step 'I open fonts panel of language settings'
	on(PanelPage).selected_interface_font.should == font
end

Then(/^the interface font must be changed to the "(.*?)" font$/) do |font|
	on(PanelPage).interface_font.should match("^#{font}")
end
