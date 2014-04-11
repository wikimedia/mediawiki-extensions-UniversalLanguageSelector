@custom-browser @firefox @internet_explorer_10 @phantomjs @sandbox.translatewiki.net
Feature: Accept-Language

  Scenario Outline: Accept-Language
    Given that my browser's accept language is <language>
    When I am at the preferences page
    Then link to the main page has text <text>

  Examples:
    | language | text          |
    | de       | Hauptseite    |
    | sr       | Главна страна |
    | sr-ec    | Главна страна |
    | sr-el    | Glavna strana |
