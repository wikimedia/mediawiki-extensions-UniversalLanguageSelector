@firefox @internet_explorer_10 @phantomjs
Feature: Autonym font

  * With tofu detection in ULS, system fonts will be given preference over webfonts.
  * Reference: https://upload.wikimedia.org/wikipedia/commons/7/7d/ULS-WebFonts-Workflow-Diagram.png

  Scenario: Autonym font is used in the ULS language search dialog for display language selection by logged-in users
    Given I am logged in
      And I open the Universal Language Selector
      And I open Display panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  Scenario: Autonym font is used in the ULS language search dialog for input language selection by logged-in users
    Given I am logged in
      And I open the Universal Language Selector
      And I switch to Input panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  Scenario: Autonym font should be used in the Interlanguage area of a page only with Interlanguage links
    When I am on the main page
    Then the Interlanguage links should use Autonym font
      And elements that are not Interlanguage links should not use Autonym font

  Scenario: Autonym font is used in the ULS language search dialog for input language selection by anonymous users
    Given I am at the main page
      And I open the Universal Language Selector
      And I open Input side panel of language settings
    When I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  #Autonym is blacklisted in Interlanguage area at moment, and may whitelist in future.
  Scenario: Autonym font should be used in the Interlanguage area of a page only with Interlanguage links
    When I am on the main page
    Then the Interlanguage links should use Autonym font
      And elements that are not Interlanguage links should not use Autonym font
