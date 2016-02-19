@firefox @internet_explorer_10 @phantomjs
Feature: Settings panel

  @ime-default-on
  Scenario Outline: Input settings display
    Given I am <user status>
      And I am on a page without interlanguage links
    When I open ULS
      And I switch to Input panel of language settings
    Then I can disable input methods
      And I can enable input methods

  Examples:
    | user status |
    | logged out  |
    | logged in   |

  Scenario: How to use link appears in the Input settings panel
    Given I am at the main page
    When I open ULS
      And I switch to Input panel of language settings
      And I click the button with the ellipsis
      And in the language filter I type ml
      And I click on the link to select Malayalam
    Then I should see the How to use link near the Malayalam transliteration item

  Scenario: More languages (input language selection)
    Given I am at the main page
    When I open ULS
      And I switch to Input panel of language settings
      And I click the button with the ellipsis
    Then I see Worldwide
      And I see Language Search
      And I can navigate back to Input Settings

  Scenario: More languages (interface language selection)
    Given I am logged in
    When I open Language panel of language settings
      And I click the button with the ellipsis
    Then I see Common Languages
      And I see Worldwide
      And I see Language Search
      And I can navigate back to Language Settings

  Scenario: Temporary live preview for menu language

    Given I am logged in
    When I open Language panel of language settings
      And I click the button with the ellipsis
      And I use the panel to change my interface language to "German"
      And I switch to Input panel of language settings
      And I click X
      And I open Language panel of language settings
      Then the panel is in English

  Scenario: The name of site content language is correct when translation language is different

    This feature is a bit hard to test. In most cases content language matches
    the language of translation. In addition this only applies to anonymous
    users in wikis where language changing for anonymous users is disabled. So
    to test this we create a somewhat artificial test case by setting the wiki
    interface language to a non-default value.

    Given I temporarily use "Finnish" as the interface language
    When I open Language panel of language settings
    Then I see "English (sama kuin sisällön)" as the name of the content language

  Scenario: Selecting language via [...] button

    Given I am logged in
      And I have reset my preferences
    When I open Language panel of language settings
      And I click the button with the ellipsis
      And I use the panel to change my interface language to "German"
      And I apply the changes
    Then my interface language is "German"

  Scenario: Regression test for bug T58913

    Given I am logged in
      And I have reset my preferences
    When I open the Universal Language Selector
      And I switch to Input panel of language settings
      And I click the button with the ellipsis
      And I use the panel to change my input language to "Finnish"
      And I close the panel to discard the changes
      And I switch to Input panel of language settings
    Then I should see English as the selected input language
