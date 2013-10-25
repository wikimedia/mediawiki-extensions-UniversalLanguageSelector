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
	on(PanelPage).get_content_font.should == @original_content_font
end

Then(/^the selected content font must be "(.*?)"$/) do |font|
	step 'I open display settings'
	step 'I open fonts panel of language settings'
	on(PanelPage).selected_content_font.should == font
end
