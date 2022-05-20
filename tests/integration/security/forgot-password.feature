Feature: Forgotten and resetting passwords
  As a user who has forgotten their password
  I want to request it be reset to continue sign in

  Background:
    Given I am signed out
    And I go to the home page
    And I click the "Sign in" button

  Scenario: See the reset password form
    When I click the "Forgot password?" link
    Then I go to the reset password page

  Scenario: Leave the form empty
    When I enter no values for "email"
    Then The "Send password reset link" button is disabled
    And The email field says "Email is required"

  Scenario Outline: Enter a bad format for email address
    When I enter an "<email>"
    Then The "Send password reset link" button is disabled
    And The email field says "Invalid email address"

    Examples:
      | email     |
      | test      |
      | 123       |
      | test@test |

  Scenario Outline: Enter valid values for the reset form
    When I reset a password with the email address "<email>"
    Then I see the confirmation message that an email was sent

    Examples:
      | email                         | password |
      | admin@maurodatamapper.com     | password |
      | researher@maurodatamapper.com | password |
