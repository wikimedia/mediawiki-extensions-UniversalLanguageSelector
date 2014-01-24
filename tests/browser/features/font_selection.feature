@commons.wikimedia.beta.wmflabs.org @login @needs-custom-setup
Feature: Font selection

  In order to have better using experience,
  As a reader and writer,
  I want to change or disable the fonts for interface and content.

  In addition the user is provided live preview feature: changes are applied
  immediately when selection is made. Changes can either be applied or discarded
  for easy testing.

  Background:
    Given I am logged in
      And I have reset my preferences
      And I set "German" as the interface language
      And I open ULS
      And I open Display panel of language settings
    When I open Fonts panel of language settings

  Scenario: Font selector appears
    Then a font selector for interface language appears
      And a font selector for content language appears

  Scenario: Discarding live preview of content font
    When I select OpenDyslexic font for the content language for the live preview
      And I close the panel to discard the changes
    # System is the default value for English and German
    Then the selected content font must be "Systemschriftart"
      And the active content font must be the same as font prior to the preview

  Scenario: Discarding live preview of interface font
    When I select OpenDyslexic font for the interface language for the live preview
      And I close the panel to discard the changes
    Then the active interface font must be the same as font prior to the preview
      # System is the default value for English and German
      And the selected interface font must be Systemschriftart

  Scenario: Applying the live preview of interface font
    When I select OpenDyslexic font for the interface language for the live preview
      And I apply the changes
    Then the interface font must be changed to the "OpenDyslexic" font
