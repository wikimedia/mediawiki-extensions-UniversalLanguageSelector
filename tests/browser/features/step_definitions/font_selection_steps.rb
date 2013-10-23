Given(/^I open ULS$/) do
	on(PanelPage).trigger_personal_element.when_visible.click
end

Given(/^I open display settings$/) do
	on(PanelPage).panel_display_element.when_visible.click
end

When(/^I open fonts panel of language settings$/) do
	on(PanelPage).panel_fonts_element.click
end
