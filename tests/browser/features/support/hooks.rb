Before('@language') do |scenario|
  @language = true
  @scenario = scenario
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

After('@reset-preferences-after') do |scenario|
  visit(ResetPreferencesPage).submit_element.click if @browser.exist?
end
