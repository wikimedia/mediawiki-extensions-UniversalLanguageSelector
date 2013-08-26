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
  step 'I see the anonymous Language Settings panel'
end

Given(/^I navigate to the Language Settings panel$/) do
  step 'I am on a page with interlanguage links'
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the Language Settings panel'
end

When(/^I click Apply Settings$/) do
  on(InterlanguagePage).apply_settings_element.click
end

When(/^I click Cancel$/) do
  on(InterlanguagePage).cancel_element.click
end

Then(/^I click Enable input$/) do
  on(InterlanguagePage).enable_input_element.when_visible.click
end

When(/^I click Fonts$/) do
  on(InterlanguagePage).fonts_settings
end

When(/^I click Input$/) do
  on(InterlanguagePage).input_settings_element.click
end

When(/^I click on the link to select Malayalam$/) do
  on(RandomPage).malayalam_link
end

When(/^I click the button with the ellipsis$/) do
  on(InterlanguagePage).ellipsis_button_element.click
end

When(/^I click the cog icon by Languages in the sidebar$/) do
  on(NoInterlanguagePage).cog_element.when_present.click
end

When(/^I click X$/) do
  on(InterlanguagePage).x_element.click
end

When(/^I navigate to the talk page$/) do
  on(InterlanguagePage).talk_element.click
end

When(/^in the language filter I type (.+)$/) do |language_abbreviation|
  on(RandomPage).language_filter=language_abbreviation
end

Then(/^a font selectbox appears$/) do
  on(InterlanguagePage).content_font_selectbox_element.should be_visible
end

Then(/^I can disable input methods$/) do
  on(InterlanguagePage).disable_input_methods_element.when_visible.should be_visible
end

Then(/^I can enable input methods$/) do
  on(InterlanguagePage).enable_input_element.when_visible.should be_visible
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
  on(InterlanguagePage) do |page|
    page.language_button_element.should_not be_visible
    page.fonts_button_element.should_not be_visible
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

Then(/^I see the anonymous Language Settings panel$/) do
  on(NoInterlanguagePage) do |page|
    page.language_button_element.when_present.should be_visible
    page.fonts_button_element.should be_visible
  end
end

Then(/^I see the Language Settings panel$/) do
  on(NoInterlanguagePage) do |page|
    page.language_button_element.when_present.should be_visible
    page.fonts_button_element.should be_visible
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

Then(/^the cog icon brings up anonymous Language Settings again$/) do
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the anonymous Language Settings panel'
end

Then(/^the cog icon brings up Language Settings again$/) do
  step 'I click the cog icon by Languages in the sidebar'
  step 'I see the Language Settings panel'
end

Then(/^a font selectbox appears for content$/) do
  on(InterlanguagePage).content_font_selectbox_element.should be_visible
end

Then(/^I should see the How to use link near the Malayalam transliteration item$/) do
  on(InterlanguagePage).how_to_use_ml_transliteration_element.should be_visible
end
