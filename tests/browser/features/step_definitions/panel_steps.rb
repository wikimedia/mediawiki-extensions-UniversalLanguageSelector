Then(/^I see "(.*?)" as the name of the content language$/) do |text|
	@browser.span(:text => "#{text}").should be_visible
end

When(/^I open "(.*?)" panel of language settings$/) do |panel|
	on(PanelPage) do |page|
		# Open the ULS panel if it's not open already
		if !page.language_settings_dialog_element.visible?
			# These can be of two different type of elements, which PageObjects do not like.
			if uls_position() == 'interlanguage'
				page.trigger_cog_element.when_visible.click
			elsif uls_position() == 'personal'
				page.trigger_personal_element.when_visible.click
			end
		end

		case panel
		when "Display"
			page.panel_display_element.when_visible.click
		when "Language"
			page.panel_display_element.when_visible.click
			page.panel_language_element.click
		when "Fonts"
			page.panel_display_element.when_visible.click
			page.panel_fonts_element.click
		when "Input"
			page.panel_input_element.when_visible.click
		else
			pending
		end
	end
end

When(/^I select "(.*?)" font for the interface language for the live preview$/) do |font|
	on(PanelPage).select_font_for_interface = font
end

When(/^I select "(.*?)" font for the content language for the live preview$/) do |font|
	on(PanelPage).select_font_for_content = font
end


When(/^I close the panel to discard the changes$/) do
	on(PanelPage) do |page|
		page.panel_button_close_element.click
		# Also close the ULS language selection if open
		if uls_position() == 'personal'
			page.uls_button_close_element.when_visible.click
		end
	end
end

Then(/^the active (.*?) font must be the same as font prior to the preview$/) do |type|
	case type
	when "content"
		on(PanelPage).get_content_font.should === @original_content_font
	when "interface"
		on(PanelPage).get_interface_font.should === @original_interface_font
	else
		pending
	end
end

Then(/^the selected (.*?) font must be "(.*?)"$/) do |type, font|
	if type == 'interface'
		type = 'ui'
	end
	step 'I open "Fonts" panel of language settings'
	Selenium::WebDriver::Support::Select.new(
		@browser.driver.find_element(:id, "#{type}-font-selector")
	).first_selected_option().attribute('value').should == font
end

When(/^I apply the changes$/) do
	on(PanelPage).panel_button_apply_element.click
	# Leave a little time for the settings to be saved. The settings window closes
	# immediately, so it is not enough to wait for it to disappear.
	sleep 4
end

Then(/^the (.*) font must be changed to the "(.*?)" font$/) do |type, font|
	case type
	when "content"
		on(PanelPage).get_content_font.should match("^#{font}")
	when "interface"
		on(PanelPage).get_interface_font.should match("^#{font}")
	else
		pending
	end
end

Then(/^I can disable input methods$/) do
	on(PanelPage).panel_disable_input_methods_element.click
end

Then(/^I can enable input methods$/) do
	on(PanelPage).panel_enable_input_methods_element.click
end

Then(/^a font selector for interface language appears$/) do
  on(PanelPage).panel_interface_font_selector_element.should be_visible
end

Then(/^a font selector for content language appears$/) do
  on(PanelPage).panel_content_font_selector_element.should be_visible
end

When(/^I use the panel to change my interface language to "(.*?)"$/) do |language|
	code = on(PanelPage).language_to_code(language)
	on(RandomPage).language_filter = code
	# Because one browser wants :enter and other :return -- sigh
	on(RandomPage).language_filter_element.send_keys [:enter, "\n"]
end

Then(/^the panel is in English/) do
	on(PanelPage).panel_language_element.text.should == 'Language'
end

When(/^I switch to "Input" panel of language settings/) do
	on(PanelPage).panel_input_element.when_visible.click
end
