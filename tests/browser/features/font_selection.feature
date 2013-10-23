@login @reset-preferences-after @commons.wikimedia.beta.wmflabs.org
Feature: Font selection

  In order to have better using experience,
  As a reader and writer,
  I want to change or disable the fonts for interface and content.

  In addition the user is provided live preview feature: changes are applied
  immediately when selection is made. Changes can either be applied or discarded
  for easy testing.

  Background:
    Given I am logged in
      And I set "German" as the interface language

  Scenario: Font selector appears
    When I open "Fonts" panel of language settings
    Then a font selector for interface language appears
    Then a font selector for content language appears

  Scenario: Discarding live preview of content font
    When I open "Fonts" panel of language settings
      And I select "OpenDyslexic" font for the content language for the live preview
      And I close the panel to discard the changes
    Then the active content font must be the same as font prior to the preview
      # System is the default value for English and German
      And the selected content font must be "system"

  Scenario: Discarding live preview of interface font
    When I open "Fonts" panel of language settings
      And I select "OpenDyslexic" font for the interface language for the live preview
      And I close the panel to discard the changes
    Then the active interface font must be the same as font prior to the preview
      # System is the default value for English and German
      And the selected interface font must be "system"

  Scenario: Applying the live preview of interface font
    When I open "Fonts" panel of language settings
      And I select "OpenDyslexic" font for the interface language for the live preview
      And I apply the changes
    Then the interface font must be changed to the "OpenDyslexic" font
