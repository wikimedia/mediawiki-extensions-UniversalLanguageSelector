@en.wikipedia.beta.wmflabs.org @ie6-bug  @ie7-bug
Feature: ULS cog behaviour on the side-bar for logged in users

  Scenario: Page without interlanguage links has cog icon and language selector
    Given I am on a page without interlanguage links
    When I click the cog icon by Languages in the sidebar
    Then I see the anonymous Language Settings panel

  Scenario: Page with interlanguage links has cog icon and language selector
    Given I am on a page with interlanguage links
    When I click the cog icon by Languages in the sidebar
    Then I see the anonymous Language Settings panel

  Scenario: Page without interlanguage links has cog icon and language selector on Talk page
    Given I am on a talk page without interlanguage links
    When I click the cog icon by Languages in the sidebar
    Then I see the anonymous Language Settings panel

  Scenario: Page with interlanguage links has cog icon and language selector on Talk page
    Given I am on a talk page with interlanguage links
    When I click the cog icon by Languages in the sidebar
    Then I see the anonymous Language Settings panel

  Scenario: Language Settings closes and opens with X button
    Given I navigate to the anonymous Language Settings panel
    When I click X
    Then I do not see the Language Settings panel
      And the cog icon brings up anonymous Language Settings again

  Scenario: Language Settings closes and opens with Apply Settings buttons
    Given I navigate to the anonymous Language Settings panel
    When I click Apply Settings
    Then I do not see the Language Settings panel
      And the cog icon brings up anonymous Language Settings again

  Scenario: Language Settings closes and opens with Cancel buttons
    Given I navigate to the anonymous Language Settings panel
    When I click Cancel
    Then I do not see the Language Settings panel
      And the cog icon brings up anonymous Language Settings again

  Scenario: Input settings display
    Given I navigate to the anonymous Language Settings panel
    When I click Input
    Then I can enable input methods
      And I can disable input methods

  Scenario: How to use link appears in the Input settings panel
    Given I navigate to the anonymous Language Settings panel
    When I click Input
      And I click Enable input
      And I click the button with the ellipsis
      And in the language filter I type ml
      And I click on the link to select Malayalam
    Then I should see the How to use link near the Malayalam transliteration item

  Scenario: Fonts default settings and display
    Given I navigate to the anonymous Language Settings panel
    When I click Fonts
    Then a font selectbox appears

  Scenario: Fonts not default settings and display
    Given I navigate to the anonymous Language Settings panel
    When I click Fonts
    Then a font selectbox appears for content

  Scenario: More languages
    Given I navigate to the anonymous Language Settings panel
      And I click Input
      And I click Enable input
    When I click the button with the ellipsis
    Then I see Worldwide
      And I see Language Search
      And I can navigate back to Input Settings
