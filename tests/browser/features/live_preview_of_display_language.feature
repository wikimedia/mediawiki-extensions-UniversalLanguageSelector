@firefox @internet_explorer_10 @phantomjs
Feature: Live preview of display language changes

  Background:
    Given I am logged in
      And I have reset my preferences
      And I am at the main page

  Scenario: Display language change is previewed immediately
    Given I open the Universal Language Selector
      And I open Display panel of language settings
      And I click the button with the ellipsis
      And in the language filter I type malayalam
      And I click on the link to select Malayalam
    Then I should see the text in the language panel in Malayalam

  Scenario: Live preview of display language changes can be reverted on cancel
    Given I open the Universal Language Selector
      And I open Display panel of language settings
      And I select a language different than English for display language
    When I click Cancel
      And I open Display panel of language settings
    Then I should see the text in the language panel in English

  Scenario: Live preview of display language changes can be reverted on closing the dialog with the X button
    Given I open the Universal Language Selector
      And I open Display panel of language settings
      And I select a language different than English for display language
    When I click X
      And I open Display panel of language settings
    Then I should see the text in the language panel in English

  # https://phabricator.wikimedia.org/T59967
  # @commons.wikimedia.beta.wmflabs.org
  Scenario: Live preview of display language changes can be reverted on closing the dialog on cancel from a different panel
    Given I open the Universal Language Selector
      And I open Display panel of language settings
      And I select a language different than English for display language
      And I switch to Input panel of language settings
    When I click Cancel
      And I open Display panel of language settings
    Then I should see the text in the language panel in English
