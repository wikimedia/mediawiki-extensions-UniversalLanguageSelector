Given(/^I am at random page$/) do
	visit RandomPage
end

Given(/^I am logged out$/) do
end

Given(/^I am logged in$/) do
	visit(LoginPage).login_with(@mediawiki_username, @mediawiki_password)
	# Assert that login worked
	loggedin = !@browser.execute_script( "return mw.user.isAnon();" )
	loggedin.should be_true
end

Given(/^I set "(.*?)" as the interface language$/) do |language|
	code = language_to_code(language)
	visit(ULSPage, :using_params => {:extra => "setlang=#{code}"})
	# And check it took effect
	actual = @browser.execute_script( "return jQuery( 'html' ).attr( 'lang' )" )
	actual.should == code
end

Given(/^I temporarily use "(.*?)" as the interface language$/) do |language|
	code = language_to_code(language)
	visit(ULSPage, :using_params => {:extra => "uselang=#{code}"})
end

Given(/^the content language is "(.*?)"$/) do |language|
	code = language_to_code(language)
	actual = @browser.execute_script( "return mw.config.get( 'wgContentLanguage' )" )
	actual.should == code
end

Given(/^the interface language is "(.*?)"$/) do |language|
	# phantomjs needs little bit time because it executes the script before
	# the page is fully loaded
	sleep 0.5;
	code = language_to_code(language)
	actual = @browser.execute_script( "return mw.config.get( 'wgUserLanguage' )" )
	actual.should == code
end

def language_to_code(language)
	case language
	when 'German'
		'de'
	when 'English'
		'en'
	when 'Finnish'
		'fi'
	else
		pending
	end
end

def get_font(selector)
	@browser.execute_script( "return $( '#{selector}' ).css( 'font-family' );" )
end

def get_content_font()
	get_font('#mw-content-text')
end

def get_interface_font()
	get_font('body')
end

After('@reset-preferences-after') do |scenario|
	visit(ResetPreferencesPage)
	on(ResetPreferencesPage).submit_element.click
end

def uls_position()
	if !defined?($uls_position)
		visit(ULSPage)
		$uls_position = @browser.execute_script( "return mw.config.get( 'wgULSPosition' )" );
	else
		$uls_position
	end
end

Before('@uls-in-sidebar-only') do |scenario|
	if uls_position() != 'interlanguage'
		scenario.skip_invoke!
	end
end

Before('@uls-in-personal-only') do |scenario|
	if uls_position() != 'personal'
		scenario.skip_invoke!
	end
end
