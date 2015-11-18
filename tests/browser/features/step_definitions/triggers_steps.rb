When(/^I click language selector trigger element$/) do
  on(PanelPage).trigger_personal
end

Then(/^I should see the language selector$/) do
  on(PanelPage) do |page|
    page.uls_element.should be_visible
    page.uls_onscreen?.should be_true
  end
end
