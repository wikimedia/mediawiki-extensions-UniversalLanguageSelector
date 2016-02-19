@firefox @internet_explorer_10 @phantomjs
Feature: Trigger in personal toolbar

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Open language selector when logged in
    Given I am logged in
    When I click language selector trigger element
    Then I should see the language selector
      And I see Common Languages
      And I see Worldwide

  Scenario: Open language settings when logged out and language change not allowed

    If the user is logged out, the user will either see the language selector
    or the settings panel, depending on whether language selection for
    anonymous users is disabled. This and next test cover both cases.

    Given I am at the main page
    When I click language selector trigger element
    Then I see the logged in language settings panel

  Scenario: Open language selector when logged out

    Given I am at the main page
    When I click language selector trigger element
    Then I should see the language selector

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
