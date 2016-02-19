# First scenario seems to fail whenever OpenDyslexic is missing
@firefox @internet_explorer_10 @phantomjs
Feature: Persistent settings

  This assumes wiki content language is English.

  Background:
    Given I am logged in
      And I have reset my preferences
      And I set "German" as the interface language
      And I open the Universal Language Selector
      And I open Display panel of language settings
      And I open Fonts panel of language settings
      And I select OpenDyslexic font for the interface language for the live preview

  @language-browsertests.wmflabs.org
  Scenario: Interface font sticks to another page
    When I apply the changes
      And I am at the main page
    Then the selected interface font must be OpenDyslexic

  @language-browsertests.wmflabs.org
  Scenario: Discarding a live preview of a font keeps the previous font
    When I close the panel to discard the changes
      And I am at the main page
    Then the selected interface font must be Systemschriftart

  Scenario: Changing both a font and an input method is saved
    When I open Input side panel of language settings
      And I click the button with the ellipsis
      And in the language filter I type ml
      And I click on the link to select Malayalam
      And I select the ml-inscript2 input method in the panel
      And I apply the changes
      And I am at the main page
    Then the selected interface font must be OpenDyslexic
      And the selected input method for Malayalam is ml-inscript2
