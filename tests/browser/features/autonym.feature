Feature: Autonym font

  * Web font should always be applied to the ULS language selector's language
    selection screen for display and input languages.
  * Web font should always be applied to the interlanguage section of MediaWiki
    when MediaWiki extension ULS is installed.

  @login @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for display language selection by logged-in users

    Given I am logged in
    When I open "Language" panel of language settings
      And I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  @login @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for input language selection by logged-in users

    Given I am logged in
    When I open "Input" panel of language settings
      And I click the button with the ellipsis
    Then the language list of ULS should use Autonym font

  @login @en.wikipedia.beta.wmflabs.org
  Scenario: Autonym font should be used in the Interlanguage area of a page with Interlanguage links

    Given I am logged in
    When I am on a page with interlanguage links
    Then the Interlanguage area should use Autonym font

  @anon-language-selection @commons.wikimedia.beta.wmflabs.org
  Scenario: Autonym font is used in the ULS language search dialog for input language selection by anonymous users

    When I open "Input" panel of language settings
      And I click the button with the ellipsis
    Then the language list of ULS should use Autonym font
