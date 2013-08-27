@commons.wikimedia.beta.wmflabs.org @en.wikipedia.beta.wmflabs.org
Feature: ULS trigger in personal toolbar

  @uls-in-personal-only
  Scenario: Open language selector
    Given I visit a random page
    When I click language selector trigger element
    Then I should see the Language selector

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
