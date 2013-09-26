Given(/^I am on a page with interlanguage links$/) do
  visit InterlanguagePage
end

Given(/^I am on a page without interlanguage links$/) do
  visit NoInterlanguagePage #  .add_links_element.when_visible.should be_visible
  # cannot do this because of https://bugzilla.wikimedia.org/show_bug.cgi?id=49139
end

Given(/^I am on a talk page with interlanguage links$/) do
  visit(InterlanguagePage).talk_element.click
end

Given(/^I am on a talk page without interlanguage links$/) do
  visit(NoInterlanguagePage).talk_element.click
end

Given(/^I navigate to the anonymous Language Settings panel$/) do
  step 'I am on a page with interlanguage links'
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the logged out language settings panel'
end

Given(/^I navigate to the Language Settings panel$/) do
  step 'I am on a page with interlanguage links'
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the logged in language settings panel'
end

When(/^I click Cancel$/) do
  on(PanelPage).panel_button_cancel_element.click
end

When(/^I click on the link to select Malayalam$/) do
  on(RandomPage).malayalam_link
end

When(/^I click the button with the ellipsis$/) do
  on(InterlanguagePage).ellipsis_button_element.click
end

When(/^I click the cog icon by Languages in the sidebar$/) do
  on(NoInterlanguagePage).cog_element.when_present.click
  # Wait for the panel to open
  on(PanelPage).panel_display_element.when_visible
end

When(/^I click X$/) do
  on(InterlanguagePage).x_element.click
end

When(/^in the language filter I type (.+)$/) do |language_abbreviation|
  on(RandomPage).language_filter=language_abbreviation
end

Then(/^I can navigate back to Input Settings$/) do
  on(InterlanguagePage) do |page|
    page.back_to_input
    page.x_element.should be_visible
  end
end

Then(/^I can navigate back to Language Settings$/) do
  on(InterlanguagePage) do |page|
    page.back_to_display
    page.x_element.should be_visible
  end
end

When(/^I choose a different language for writing$/) do
  on(InterlanguagePage).non_default_language_element.when_visible.click
end

Then(/^I do not see the Language Settings panel$/) do
  on(PanelPage) do |page|
    page.panel_language_element.should_not be_visible
    page.panel_fonts_element.should_not be_visible
    page.default_language_button_element.should_not be_visible
    page.other_language_button_element.should_not be_visible
  end
end

Then(/^I see Common Languages$/) do
  on(InterlanguagePage).language_list.should match Regexp.escape('Common languages')
end

Then(/^I see Language Search$/) do
  on(InterlanguagePage).language_search_element.should be_visible
end

Then(/^I see the logged out language settings panel$/) do
  on(PanelPage) do |page|
    page.panel_language_element.should be_visible
    page.panel_fonts_element.should be_visible
  end
end

Then(/^I see the logged in language settings panel$/) do
  on(PanelPage) do |page|
    page.panel_language_element.should be_visible
    page.panel_fonts_element.should be_visible
    page.default_language_button_element.should be_visible
    page.other_language_button_element.should be_visible
  end
end

Then(/^I see Worldwide$/) do
   on(InterlanguagePage) do |page|
    page.language_list.should match Regexp.escape('Worldwide')
    page.english_link_element.should be_visible
  end
end

Then(/^I click the cog icon to open language settings again$/) do
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the logged out language settings panel'
end

Then(/^the cog icon brings up Language Settings again$/) do
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the Language Settings panel'
end

Then(/^I should see the How to use link near the Malayalam transliteration item$/) do
  on(InterlanguagePage).how_to_use_ml_transliteration_element.should be_visible
end
