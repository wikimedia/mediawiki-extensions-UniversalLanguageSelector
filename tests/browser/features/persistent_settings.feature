@login @reset-preferences-after @en.wikipedia.beta.wmflabs.org @commons.wikimedia.beta.wmflabs.org
Feature: Persistent settings

  Background:
    Given I am logged in
      And I set "German" as the interface language
      And the content language is "English"

  Scenario: Interface font sticks to another page
    When I open "Fonts" panel of language settings
      And I select "OpenDyslexic" font for the interface language for the live preview
      And I apply the changes
      And I visit a random page
    Then the selected interface font must be "OpenDyslexic"

  Scenario: Discarding a live preview of a font keeps the previous font
    When I open "Fonts" panel of language settings
      And I select "OpenDyslexic" font for the interface language for the live preview
      And I close the panel to discard the changes
      And I visit a random page
    Then the selected interface font must be "system"
