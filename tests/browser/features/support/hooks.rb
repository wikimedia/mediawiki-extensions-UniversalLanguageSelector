Before("@language") do |scenario|
  @language = true
  @scenario = scenario
end

After("@reset-preferences-after") do |scenario|
  visit(ResetPreferencesPage).submit_element.click if @browser.exist?
end
