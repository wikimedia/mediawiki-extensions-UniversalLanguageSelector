# The tests do not normalize the font-family passed back by the browser
# Firefox/Chrome/Phantomjs handle the normalization differently.
#
# https://bugzilla.wikimedia.org/show_bug.cgi?id=57101
@phantomjs-bug
Feature: Autonym font

  * Web font should always be applied to the ULS language selector's language
    selection screen for display and input languages.
  * Web font should always be applied to the interlanguage section of MediaWiki
    when MediaWiki extension ULS is installed.

  @login @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for display language selection by logged-in users
    Given I am logged in
      And I open the Universal Language Selector
      And I open Display panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  @login @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for input language selection by logged-in users
    Given I am logged in
      And I open the Universal Language Selector
      And I switch to Input panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  @en.wikipedia.beta.wmflabs.org
  Scenario: Autonym font should be used in the Interlanguage area of a page only with Interlanguage links
    When I am on the main page
    Then the Interlanguage links should use Autonym font
      And elements that are not Interlanguage links should not use Autonym font

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for input language selection by anonymous users
    Given I am at random page
      And I open the Universal Language Selector
      And I open Input side panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font
