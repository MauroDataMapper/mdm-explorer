# Copyright 2022-2023 University of Oxford
# and Health and Social Care Information Centre, also known as NHS Digital
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
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
