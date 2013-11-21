Then(/^the selected interface font must be (.*?)$/) do |font|
	step 'I open the Universal Language Selector'
	step 'I open Display panel of language settings'
	step 'I open Fonts panel of language settings'
	on(PanelPage).font_for_interface.should == font
end
