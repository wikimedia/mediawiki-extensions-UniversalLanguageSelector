@login @reset-preferences-after
Feature: Persistent settings

  This assumes wiki content language is English.

  Background:
    Given I am logged in
      And I set interface language that is different from content language and has a font

  Scenario: Interface font sticks to another page
    When I open "Fonts" panel of language settings
      And I select a font for the interface language
      And I apply the changes
      And I visit a random page
      And I open "Fonts" panel of language settings
    Then the selected interface font must be what I previously selected

  Scenario: Discarding a live preview of a font keeps the previous font
    When I open "Fonts" panel of language settings
      And I select a font for the interface language
      And I close the panel to discard the changes
      And I visit a random page
    Then the selected interface font must be "system"
