@en.wikipedia.beta.wmflabs.org @ie6-bug @ie7-bug
Feature: ULS cog in the sidebar allows access to language settings

  @login @uls-in-sidebar-only
  Scenario Outline: Opening language settings from sidebar
    Given I am <user status>
      And I am on <page type>
    When I click the cog icon by Languages in the sidebar
    Then I see the <user status> language settings panel

  Examples:
    | user status | page type                               |
    | logged out  | a page without interlanguage links      |
    | logged in   | a page with interlanguage links         |
    | logged out  | a talk page without interlanguage links |
    | logged out  | a talk page with interlanguage links    |

  @login @uls-in-sidebar-only
  Scenario Outline: Closing language settings without saving
    Given I am <user status>
      And I am on a page without interlanguage links
    When I click the cog icon by Languages in the sidebar
      And <close method>
    Then I do not see the Language Settings panel
      And I click the cog icon by Languages in the sidebar
      And I see the <user status> language settings panel

  Examples:
    | user status | close method           |
    | logged in   | I click X              |
    | logged out  | I click Cancel         |
    # It is weird that this works, since the button is disabled until changes
    # have been made
    | logged out  | I click Apply Settings |

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
