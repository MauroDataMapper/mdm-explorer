Feature: Accessing public content
  As a site visitor who is not a registered user
  I want to see publicly visible content in the Mauro Data Explorer

  Background:
    Given I am signed out

  Scenario: Viewing the home page
    When I click on the main header logo
    Then I go to the home page

  Scenario Outline: Navigating from the home page to public pages
    Given I am on the home page
    When I click on "<link>"
    Then I go to the page with URL "<url>"

    Examples:
      | link         | url    |
      | About        | /about |
      | Help Section | /help  |

  Scenario Outline: Navigating from the home page to restricted pages
    Given I am on the home page
    When I click on "<link>"
    Then I go to the sign in page

    Examples:
      | link        |
      | Browse Data |
      | Search Data |

  Scenario: Viewing the about page
    When I click on the "About" link in the header
    Then I go to the about page

  Scenario: Viewing the help page
    When I click on the "Help" link in the header
    Then I go to the about page

  Scenario: Only seeing publicly available links in the header
    Given I am on the home page
    Then I cannot see restricted page links in the header
