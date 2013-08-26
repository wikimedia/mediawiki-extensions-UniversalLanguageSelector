When(/^I click language selector trigger element$/) do
  on(RandomPage).uls_trigger
end

Then(/^I should see the Language selector$/) do
  on(RandomPage).language_settings_dialog_element.should be_visible
end

Then(/^I should see a cog icon near the 'Languages' header$/) do
    on(RandomPage).cog_element.should exist
end
