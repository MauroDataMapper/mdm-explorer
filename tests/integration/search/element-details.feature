Feature: View details on a data element
  As an authenticated user
  I want to view detailed information about a particular data element

  Background:
    Given I am signed in
    And I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"

  Scenario: Initial view of the data element
    Then I see the label for the data element
    And I see the data type of the data element
    And I see the profile information of the data element
    And I see the value distribution chart for the data element

  Scenario: Bookmark the data element
    When I click on the empty bookmark icon
    Then The bookmark icon changes to be solid
    And A bookmark added success message is shown
