Feature: Contact and support
  As a site visitor who is not a registered user
  I want to submit a support request when I need assistance

  Background:
    Given I go to the contact and support page

  Scenario: Leave the support form empty
    When I enter no values in the request support form
    Then The button "Request support" is disabled

  Scenario: Leave mandatory fields empty in the support form
    When I enter no values in the mandator fields of the request support form
    Then The button "Request support" is disabled
    And The first name field says "First name is required"
    And The last name field says "Last name is required"
    And The email field says "Email is required"
    And The subject field says "Subject is required"
    And The message field says "Message is required"

  Scenario Outline: Enter an email address with bad format in the support form
    When I enter values for all mandatory fields in the request support form
    And I enter "<email>" in the email field
    Then The button "Request support" is disabled
    And The email field says "Please enter a valid email address"

    Examples:
      | email     |
      | test      |
      | 123       |
      | test@test |

  Scenario: Submit a support request
    When I enter valid values to the request support form
    And I click the "Request support" button
    Then I see a confirmation that the request was sent

  Scenario: Submit feedback
    When I click the "Send feedback" button
    And I enter a message into the feedback form
    And I click the "Send feedback" button in the dialog
    Then I see a confirmation that the request was sent
