When(/^I click language selector trigger element$/) do
	on(RandomPage).uls_trigger
end

Then(/^I should see the language selector$/) do
	on(PanelPage).uls_element.should be_visible
end
