Given(/^I open ULS$/) do
	on(PanelPage).trigger_personal_element.when_visible.click
end

Then(/^the active content font must be the same as font prior to the preview$/) do
	pending("bug #56081") do
		on(PanelPage).content_font.should == @original_content_font
	end
end

Then(/^the active interface font must be the same as font prior to the preview$/) do
	on(PanelPage).interface_font.should == @original_interface_font
end

Then(/^the selected content font must be "(.*?)"$/) do |font|
	step "I open Display panel of language settings"
	step "I open Fonts panel of language settings"
	on(PanelPage).selected_content_font.should == font
end

Then(/^the interface font must be changed to the "(.*?)" font$/) do |font|
	on(PanelPage).interface_font.should match("^#{font}")
end
