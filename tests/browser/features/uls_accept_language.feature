@ie6-bug  @ie7-bug  @ie8-bug  @ie9-bug @language @sandbox.translatewiki.net
Feature: Universal Language Selector Accept-Language

  Scenario Outline: Accept-Language
    Given that my browser's accept language is <language>
    When I visit a random page
    Then link to the main page has text <text>

  Examples:
    | language | text          |
    | de       | Hauptseite    |
    | sr       | Главна страна |
    | sr-ec    | Главна страна |
    | sr-el    | Glavna strana |
