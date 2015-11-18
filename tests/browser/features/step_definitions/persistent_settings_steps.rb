Then(/^the selected interface font must be (.*?)$/) do |font|
  step 'I open the Universal Language Selector'
  step 'I open Display panel of language settings'
  step 'I open Fonts panel of language settings'
  on(PanelPage).selected_interface_font.should == font
end

Then(/^the selected input method for Malayalam is ml-inscript2$/) do
  step 'I click on an input box'
  step 'I should see the input method indicator'
  step 'in it there must be an element with Malayalam text'
end

When(/^I select the ml-inscript2 input method in the panel$/) do
  on(PanelPage).ml_inscript2_radio_element.click
end
