Given(/^I am at random page$/) do
  visit RandomPage
end

Given(/^I am logged out$/) do
end

Given(/^I am logged in$/) do
  visit(LoginPage).login_with(@mediawiki_username, @mediawiki_password)
end

def language_to_code(language)
	case language
	when 'German'
		'de'
	when 'English'
		'en'
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

Before('@uls-in-sidebar-only') do |scenario|
	if !defined?($uls_position)
		visit(ULSPage)
		$uls_position = @browser.execute_script( "return mw.config.get( 'wgULSPosition' )" );
	end
	if $uls_position != 'interlanguage'
		scenario.skip_invoke!
	end
end
