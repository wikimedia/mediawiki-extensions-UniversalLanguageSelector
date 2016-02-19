@firefox @internet_explorer_10 @phantomjs
Feature: Font selection default disabled

  In order to have better using experience,
  As a reader and writer,
  I want to change or disable the fonts for interface and content.

  In addition the user is provided live preview feature: changes are applied
  immediately when selection is made. Changes can either be applied or discarded
  for easy testing.

  This feature is similar to font_selection_default_enabled,
  but it is targeted at wikis where automatic font downloading
  is disabled by default ($wgULSWebfontsEnabled = false).

  Background:
    Given I am logged in
      And I have reset my preferences
      And I set "German" as the interface language
      And I open ULS
      And I open Display panel of language settings
    When I open Fonts panel of language settings

  Scenario: Font selector pane appears
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear
      And the checkbox to enable fonts downloading appears
      And the checkbox to enable fonts downloading is not checked
      And webfonts are not applied to body

  Scenario: Enabling fonts downloading with live preview
    When I click the checkbox to enable fonts downloading
    Then a font selector for interface language appears
      And a font selector for content language appears
      And the checkbox to enable fonts downloading appears
      And the checkbox to enable fonts downloading is checked
      And the selected content font must be system
      And webfonts are applied to body

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Enabling fonts downloading without saving the preferences
    When I click the checkbox to enable fonts downloading
      And I select OpenDyslexic font for the content language for the live preview
      And I close the panel to discard the changes
      And I open Display panel of language settings
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear
      And the active interface font must be the same as font prior to the preview
      And the active content font must be the same as font prior to the preview

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Enabling fonts downloading and saving the preferences
    When I click the checkbox to enable fonts downloading
      And I select OpenDyslexic font for the interface language for the live preview
      And I apply the changes
    Then webfonts are applied to body
      And the interface font is OpenDyslexic

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Enabling fonts downloading and going to another page
    When I click the checkbox to enable fonts downloading
      And I select OpenDyslexic font for the content language for the live preview
      And I apply the changes
      And I am on the main page
    Then webfonts are applied to body
      And the content font is OpenDyslexic

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Enabling fonts downloading and then disabling them
    When I click the checkbox to enable fonts downloading
      And I select OpenDyslexic font for the interface language for the live preview
      And I apply the changes
      And I am on the main page
      And I open ULS
      And I open Display panel of language settings
      And I open Fonts panel of language settings
      And I click the checkbox to disable fonts downloading
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear

  @commons.wikimedia.beta.wmflabs.org
  Scenario: Enabling fonts downloading and then disabling them and saving the preferences
    When I click the checkbox to enable fonts downloading
      And I select OpenDyslexic font for the interface language for the live preview
      And I apply the changes
      And I am on the main page
      And I open ULS
      And I open Display panel of language settings
      And I open Fonts panel of language settings
      And I click the checkbox to disable fonts downloading
      And I apply the changes
      And I am on the main page
      And I open ULS
      And I open Display panel of language settings
    Then a font selector for interface language doesn't appear
      And a font selector for content language doesn't appear
      And the checkbox to enable fonts downloading is not checked
      And webfonts are not applied to body
