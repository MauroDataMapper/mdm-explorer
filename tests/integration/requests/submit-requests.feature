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
Feature: Submitting data specifications
  As an authenticated user
  I want to submit my data specification request to be processed further

  Background:
    Given I am signed in
    And I go to the data specifications page
    And I have at least one draft data specification
    And I have at least one submitted data specification

  Scenario: Submit a data specification
    When I click on an draft data specification
    And I click on the "Submit data specification" button
    Then I see a confirmation that the data specification was submitted
    And The status of the data specification changes to "submitted"
    And The number of data specifications decreases in the header

  Scenario: Copy a submitted data specification
    When I click on a submitted data specification
    And I click on the "Copy" button
    And I enter a name for the new data specification
    Then I see a confirmation that the new data specification was created
    And A new data specification with the chosen name appears in the data specification list
    And The number of data specifications increases in the header
