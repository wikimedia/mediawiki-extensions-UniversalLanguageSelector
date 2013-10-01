config = YAML.load_file('config/config.yml')
mediawiki_username = config['mediawiki_username']

Before do |scenario|
  @config = config
  @random_string = Random.new.rand.to_s
  @mediawiki_username = mediawiki_username
  unless @language
    @browser = browser(environment, test_name(scenario), 'default')
    $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
  end
end

Before('@language') do |scenario|
  @language = true
  @scenario = scenario
end

Before('@login') do
  puts "MEDIAWIKI_PASSWORD environment variable is not defined! Please export a value for that variable before proceeding." unless ENV['MEDIAWIKI_PASSWORD']
end

Before('@uls-in-personal-only') do |scenario|
  if uls_position() != 'personal'
    scenario.skip_invoke!
  end
end

Before('@uls-in-sidebar-only') do |scenario|
  if uls_position() != 'interlanguage'
    scenario.skip_invoke!
  end
end

After do |scenario|
  if environment == :saucelabs
    sauce_api(%Q{{"passed": #{scenario.passed?}}})
    sauce_api(%Q{{"public": true}})
  end
  @browser.close unless ENV['KEEP_BROWSER_OPEN'] == 'true'
end

After('@reset-preferences-after') do |scenario|
  visit(ResetPreferencesPage)
  on(ResetPreferencesPage).submit_element.click
end
