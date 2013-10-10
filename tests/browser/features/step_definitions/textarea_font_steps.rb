When(/^I set the editing fonts to "(.*?)"$/) do |editing_font|
	visit(PreferencesPage) do |page|
		page.preftab_editing_element.click
		page.pref_editfont_element.select_value editing_font
		page.save_element.click
	end
end

When(/^I edit a page$/) do
	visit(NoInterlanguagePage).edit_link_element.click
end

Then(/^I should see the edit area text being displayed using "(.*?)" font$/) do |font|
	on(EditPage).editarea_element.style("font-family").should match(/^#{font}/)
end
