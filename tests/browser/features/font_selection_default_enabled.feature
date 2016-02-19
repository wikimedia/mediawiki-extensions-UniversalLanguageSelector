@firefox @internet_explorer_10 @language-browsertests.wmflabs.org @phantomjs
Feature: Font selection default enabled

  In order to have better using experience,
  As a reader and writer,
  I want to change or disable the fonts for interface and content.

  In addition the user is provided live preview feature: changes are applied
  immediately when selection is made. Changes can either be applied or discarded
  for easy testing.

  This feature is similar to font_selection_default_disabled,
  but it is targeted at wikis where automatic font downloading
  is enabled by default ($wgULSWebfontsEnabled = true).

  Background:
    Given I am logged in
      And I have reset my preferences
      And I set "German" as the interface language
      And I open ULS
      And I open Display panel of language settings
    When I open Fonts panel of language settings

  Scenario: Font selector pane appears
    Then a font selector for interface language appears
      And a font selector for content language appears
      And the checkbox to enable fonts downloading appears
      And the checkbox to enable fonts downloading is checked
      And webfonts are applied to body

  Scenario: Discarding live preview of content font
    When I select OpenDyslexic font for the content language for the live preview
      And I close the panel to discard the changes
      And I open Display panel of language settings
    Then the selected content font must be system
      And the active content font must be the same as font prior to the preview

  Scenario: Discarding live preview of interface font
    When I select OpenDyslexic font for the interface language for the live preview
      And I close the panel to discard the changes
    Then the active interface font must be the same as font prior to the preview
      And the selected interface font must be Systemschriftart

  Scenario: Applying the live preview of interface font
    When I select OpenDyslexic font for the interface language for the live preview
      And I apply the changes
    Then the interface font is OpenDyslexic

  Scenario: Disabling fonts if they are enabled by default
    When I click the checkbox to enable fonts downloading
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear
      And the checkbox to enable fonts downloading is not checked

  Scenario: Disabling fonts when they are enabled by default and going to another page
    When I click the checkbox to disable fonts downloading
      And I apply the changes
      And I am on the main page
      And I open ULS
      And I open Display panel of language settings
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear
      And the checkbox to enable fonts downloading is not checked
      And webfonts are not applied to body

  Scenario: Disabling fonts, going to another page, and re-enabling fonts
    When I click the checkbox to disable fonts downloading
      And I apply the changes
      And I am on the main page
      And I open ULS
      And I open Display panel of language settings
      And I open Fonts panel of language settings
      And I click the checkbox to enable fonts downloading
    Then a font selector for interface language appears
      And a font selector for content language appears
      And the checkbox to enable fonts downloading appears
      And the checkbox to enable fonts downloading is checked
      And webfonts are applied to body
