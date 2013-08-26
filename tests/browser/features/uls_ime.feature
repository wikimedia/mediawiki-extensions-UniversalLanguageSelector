@commons.wikimedia.beta.wmflabs.org
Feature: Universal Language Selector input method engine

User is able to select among different input methods via a menu which is
activated by the input method indicator. User can type with selected input
method in different input fields and temporarily activate and deactivate the
input method.

  Scenario: Input method indicator is shown

  The input method indicator is shown when input field gets a focus.

    Given I am at random page
    When I click on an input box
    Then I should see the input method indicator

  Scenario: Input method menu

  Input method menu is shown when user clicks the input method indicator.

    Given I am at random page
    When I click on an input box
      And I click on the input method indicator
    Then I should see input methods for English
      And I should see a list of available input methods
      And I should see a list of suggested languages

  Scenario: Unsupported input language

  User visits a wiki with content language that does not have have an input
  method.

    Given I am on a wiki in Kotava language
    When I open the input method menu
    Then I should see input methods for Kotava

  Scenario: Sticky input methods

  Chosen input method selection persists across page loads.

    Given I am at random page
    When I open the input method menu
      And I choose ml as the input language
      And I open the input method menu
      And I click on the Malayalam InScript 2 menu item
      And I press Control-M
      And I go to another random page
      And I click on an input box
      And I press Control-M
    Then I should see the input method indicator
      And in it there must be an element with Malayalam text
