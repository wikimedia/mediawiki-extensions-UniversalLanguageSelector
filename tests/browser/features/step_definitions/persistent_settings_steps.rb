Then(/^the selected interface font must be (.*?)$/) do |font|
	step 'I open the Universal Language Selector'
	step 'I open Display panel of language settings'
	step 'I open Fonts panel of language settings'
	on(PanelPage).font_for_interface.should == font
end

Then(/^the selected input method for Malayalam is ml-inscript2$/) do
	@browser.execute_script(
		"return $.parseJSON( mw.user.options.values['uls-preferences'] ).ime.imes.ml"
	).should == 'ml-inscript2'
end

When(/^I select the ml-inscript2 input method in the panel$/) do
	on(PanelPage).ml_inscript2_radio_element.click
end
