Feature: Sign out
  As an authenticated user
  I want to sign out of Mauro Data Explorer

  Background:
    Given I am signed in
    And I go to the dashboard page

  Scenario: Sign out of the current session
    When I click my user icon
    And I click the "Sign out" button
    Then I am no longer signed in
    And I go to the home page
    And The "Sign in" button is shown
