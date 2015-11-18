Given(/^that my browser's accept language is (.+)$/) do |language|
  browser = browser(test_name(@scenario), { language: language })
  $session_id = browser.driver.instance_variable_get(:@bridge).session_id
end

When(/^I am at the preferences page$/) do
  visit PreferencesPage
end

Then(/^link to the main page has text (.+)$/) do |text|
  on(MainPage).main_page_element.text.should == text
end
