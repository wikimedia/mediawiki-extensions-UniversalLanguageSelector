Then(/^I open Input panel of language settings$/) do
  on(PanelPage).panel_input_element.when_visible.click
end
