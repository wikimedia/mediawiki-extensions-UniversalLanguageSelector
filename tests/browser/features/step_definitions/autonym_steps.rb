When(/^I am on the main page$/) do
  visit MainPage
end

Then(/^I open Input side panel of language settings$/) do
  on(PanelPage).panel_side_input_element.when_visible.click
end

Then(/^the Interlanguage links should use Autonym font$/) do
  on(InterlanguagePage).interlang_link_element.style('font-family').should == "'Autonym',sans-serif"
end

Then(/^elements that are not Interlanguage links should not use Autonym font$/) do
  on(MainPage).non_interlanguage_links_use_autonym_font?.should == false
end
