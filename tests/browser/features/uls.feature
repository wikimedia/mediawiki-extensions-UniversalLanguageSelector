@sandbox.translatewiki.net
Feature: Universal Language Selector User language selector

  @test2.wikipedia.org
  Scenario: Open Language selector
    Given I visit a random page
    When I click language selector trigger element
    Then I should see the Language selector

  Scenario: The cog icon is visible in the sidebar on an article
    Given I am at random page
    Then I should see a cog icon near the 'Languages' header
