@commons.wikimedia.beta.wmflabs.org @login @reset-preferences-after
Feature: Persistent settings

  This assumes wiki content language is English.

  Background:
    Given I am logged in
      And I set "German" as the interface language
      And I open the Universal Language Selector
      And I open Display panel of language settings
      And I open Fonts panel of language settings
      And I select OpenDyslexic font for the interface language for the live preview

  Scenario: Interface font sticks to another page
    When I apply the changes
      And I visit a random page
    Then the selected interface font must be OpenDyslexic

  Scenario: Discarding a live preview of a font keeps the previous font
    When I close the panel to discard the changes
      And I visit a random page
    Then the selected interface font must be Systemschriftart
