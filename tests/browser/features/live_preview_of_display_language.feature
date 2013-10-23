@login @reset-preferences-after
Feature: Live preview of display language changes

  Background:
    Given I am logged in
      And I set "English" as the interface language
      And I am on a page with interlanguage links

  Scenario: Display language change is previewed immediately
    Given I open "Language" panel of language settings
      And I click the button with the ellipsis
      And in the language filter I type hi
      And I click on the link to select Hindi
    Then I should see the text in the language panel in Hindi

  Scenario: Live preview of display language changes can be reverted on cancel
    Given I open "Language" panel of language settings
      And I select a language different than English for display language
    When I click Cancel
      And I open "Language" panel of language settings
    Then I should see the text in the language panel in English

  Scenario: Live preview of display language changes can be reverted on closing the dialog with the X button
    Given I open "Language" panel of language settings
      And I select a language different than English for display language
    When I click X
      And I open "Language" panel of language settings
    Then I should see the text in the language panel in English

  Scenario: Live preview of display language changes can be reverted on closing the dialog on cancel from a different section
    Given I open "Language" panel of language settings
      And I select a language different than English for display language
      And I switch to "Input" panel of language settings
    When I click Cancel
      And I open "Language" panel of language settings
    Then I should see the text in the language panel in English

  Scenario: Font setting is reset after pressing "Cancel"
    Given I open "Fonts" panel of language settings
    When I set English font to OpenDyslexic
      And I apply the changes
      And I open "Fonts" panel of language settings
      And I set English font to System
      And I click Cancel
    When I open "Fonts" panel of language settings
    Then the selected content font must be OpenDyslexic
