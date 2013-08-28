@commons.wikimedia.beta.wmflabs.org @en.wikipedia.beta.wmflabs.org
Feature: ULS settings panel

  @login
  Scenario Outline: Input settings display
    Givan I am <user status>
      And I am on a page without interlanguage links
    When I open "Input" panel of language settings
    Then I can enable input methods
      And I can disable input methods

  Examples:
    | user status |
    | logged out  |
    | logged in   |

  Scenario: How to use link appears in the Input settings panel
    Given I am at random page
    When I open "Input" panel of language settings
      And I click the button with the ellipsis
      And in the language filter I type ml
      And I click on the link to select Malayalam
    Then I should see the How to use link near the Malayalam transliteration item

  Scenario: More languages (input language selection)
    Given I am at random page
    When I open "Input" panel of language settings
      And I click the button with the ellipsis
    Then I see Worldwide
      And I see Language Search
      And I can navigate back to Input Settings

  @login
  Scenario: More languages (interface language selection)
    Given I am logged in
    When I open "Language" panel of language settings
      And I click the button with the ellipsis
    Then I see Common Languages
      And I see Worldwide
      And I see Language Search
      And I can navigate back to Language Settings
