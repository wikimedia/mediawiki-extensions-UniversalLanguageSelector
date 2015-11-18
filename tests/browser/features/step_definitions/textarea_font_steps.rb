When(/^I set the editing fonts to "(.*?)"$/) do |editing_font|
  visit(PreferencesPage) do |page|
    page.editing_tab_element.click
    page.editing_font_element.select_value editing_font
    page.save_element.click
  end
end

When(/^I start editing a page$/) do
  visit(NoInterlanguagePage).edit_link_element.click
end

When(/^I select (.*?) font for the content language$/) do |font|
  step 'I open the Universal Language Selector'
  step 'I open Display panel of language settings'
  step 'I open Fonts panel of language settings'
  step "I select #{font} font for the content language for the live preview"
  step 'I apply the changes'
end

Then(/^I should see the edit area text being displayed using "(.*?)" font$/) do |font|
  on(EditPage).editarea_element.style('font-family').should match(/^#{font}/)
end
