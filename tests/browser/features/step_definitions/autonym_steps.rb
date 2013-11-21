Then(/^I open Input panel of language settings$/) do
  on(PanelPage).panel_input_element.when_visible.click
end

Then(/^I open Input side panel of language settings$/) do
  on(PanelPage).panel_side_input_element.when_visible.click
end
