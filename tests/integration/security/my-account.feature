Feature: Viewing and managing my account
  As an authenticated user
  I want to view my account details and make changes to my account

  Background:
    Given I am signed in
    And I go to the account page

  Scenario: Viewing my account details
    Then I see all details recorded against my account

  Scenario: Modify basic information
    When I click the "Edit" button in the "Basic information" section
    And I make valid changes to the basic information form fields
    And I click the "Update" button for the basic information form
    Then My changes now appear in the "Basic information" section
    And I see a success message

  Scenario: Modify then cancel basic information changes
    When I click the "Edit" button in the "Basic information" section
    And I make valid changes to the basic information form fields
    And I click the "Cancel" button for the basic information form
    Then The original information appears in the "Basic information" section

  Scenario: Leave required fields blank in basic information
    When I click the "Edit" button in the "Basic information" section
    And I remove values from fields marked with "*"
    Then The "Update" button for the basic information form is disabled

  Scenario: Modify contact information
    When I click the "Edit" button in the "Contact information" section
    And I change the email address
    And I click the "Update" button for the contact information form
    And I confirm that I must sign out to continue
    Then I go to the sign in page
    And I see a success message

  Scenario: Modify then cancel contact information changes
    When I click the "Edit" button in the "Contact information" section
    And I change the email address
    And I click the "Cancel" button for the contact information form
    Then The original information appears in the "Contact information" section

  Scenario: Modify contact information but do not confirm sign out
    When I click the "Edit" button in the "Contact information" section
    And I change the email address
    And I click the "Update" button for the contact information form
    And I do not confirm that I should sign out to continue
    Then The original information appears in the "Contact information" section

  Scenario: Leave required fields blank in contact information
    When I click the "Edit" button in the "contact information" section
    And I remove values from fields marked with "*"
    Then The "Update" button for the contact information form is disabled
