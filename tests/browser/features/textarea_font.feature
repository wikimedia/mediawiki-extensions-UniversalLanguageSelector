@firefox @internet_explorer_10 @phantomjs
Feature: Font preferences respected in different languages

  If a user has an edit font preferences respect that preference.
  If a user has no edit font preference, but the UI language has a monospace defined,
  the edit area has monospace font, given there is no ULS webfont preference for the user.
  If a user has no edit font preference, but the UI language has no monospace defined,
  the edit area has the font according to the ULS webfont preferences.

  Background:
    Given I am logged in
      And I have reset my preferences

  Scenario: Edit area fonts should not change on UI language change if the user preferences for edit area font are set
    When I set the editing fonts to "monospace"
      And I set "Hindi" as the interface language
      And I start editing a page
    Then I should see the edit area text being displayed using "monospace" font

  # Needs OpenDyslexic font to have been configured on the target wiki
  Scenario: Edit area should use the fonts selected by the user from ULS for a language
    When I select OpenDyslexic font for the content language
      And I start editing a page
    Then I should see the edit area text being displayed using "OpenDyslexic" font

  Scenario: Edit area should use the ULS selected fonts when content language has a ULS font selection
    When I open Language panel of language settings
      And I click the button with the ellipsis
      And I use the panel to change my interface language to "German"
      And I open Fonts panel of language settings
      And I select "OpenDyslexic" font for the content language for the live preview
      And I apply the changes
      And I start editing a page
    Then I should see the edit area text being displayed using "OpenDyslexic" font

  Scenario: Edit area should use the system default fonts when content language does not have any ULS font selection
    When I open Language panel of language settings
      And I click the button with the ellipsis
      And I use the panel to change my interface language to "German"
      And I apply the changes
      And I start editing a page
    Then I should see the edit area text being displayed using "monospace" font

  Scenario: Edit area should use browser's default Monospace font for languages that have a default monospace font (Latin, Cyrillic, Hebrew etc.)
    When I start editing a page
    Then I should see the edit area text being displayed using "monospace" font
