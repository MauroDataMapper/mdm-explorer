// /*
// Copyright 2022-2023 University of Oxford
// and Health and Social Care Information Centre, also known as NHS Digital
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0
// */
// import { Injectable } from '@angular/core';
// import { AdminUser, ResearchUser } from '@maurodatamapper/sde-resources';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class FakeResources {
//   adminUsers: AdminUser[] = [
//     {
//       id: '15eaf2b0-833a-434a-ad3e-57de2f4b0885',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       email: 'admin1@test.com',
//       mauroCoreUser: 'coreUser (admin1@test.com)',
//       isDeleted: false,
//       oidcIssuingAuthority: 'Issuing Authority (admin1@test.com)',
//       oidcSubject: 'Subject (admin1@test.com)',
//     },
//   ];
//
//   researchUsers: ResearchUser[] = [
//     {
//       id: '93f4e049-5105-42f8-aaa3-1925a0f52561',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       email: 'researcher1@test.com',
//       mauroCoreUser: 'coreUser (researcher1@test.com)',
//       isDeleted: false,
//       oidcIssuingAuthority: 'Issuing Authority (researcher1@test.com)',
//       oidcSubject: 'Subject (researcher1@test.com)',
//     },
//     {
//       id: 'a84114f2-41ab-41e4-a88a-08ec0d3976fc',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       email: 'researcher2@test.com',
//       mauroCoreUser: 'coreUser (researcher2@test.com)',
//       isDeleted: false,
//       oidcIssuingAuthority: 'Issuing Authority (researcher2@test.com)',
//       oidcSubject: 'Subject (researcher2@test.com)',
//     },
//     {
//       id: '76062aa2-a67e-4a76-88bb-e63c878606ee',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       email: 'researcher3@test.com',
//       mauroCoreUser: 'coreUser (researcher3@test.com)',
//       isDeleted: false,
//       oidcIssuingAuthority: 'Issuing Authority (researcher3@test.com)',
//       oidcSubject: 'Subject (researcher3@test.com)',
//     },
//   ];
//
//   organisations: Organisation[] = [
//     {
//       id: 'e4e49288-3c0a-4b98-a387-2a813c1bd7fa',
//       createdBy: this.adminUsers[0].id,
//       createdAt: new Date('2023-04-28T00:00:00.000Z'),
//       name: 'Fake Org 1',
//       description: 'A fake organisation for development (Fake Org 1)',
//       mauroCoreGroup: 'Mauro core group (Fake Org 1)',
//       isDeleted: false,
//     },
//     {
//       id: '441d4474-f92c-4152-bd4a-17ce04b1a20d',
//       createdBy: this.adminUsers[0].id,
//       createdAt: new Date('2023-04-28T00:00:00.000Z'),
//       name: 'Fake Org 2',
//       description: 'A fake organisation for development (Fake Org 2)',
//       mauroCoreGroup: 'Mauro core group (Fake Org 2)',
//       isDeleted: false,
//     },
//     {
//       id: '6d6bd8c3-daa3-4a7c-b9c2-6d1f0893705b',
//       createdBy: this.adminUsers[0].id,
//       createdAt: new Date('2023-04-28T00:00:00.000Z'),
//       name: 'Fake Org 3',
//       description: 'A fake organisation for development (Fake Org 3)',
//       mauroCoreGroup: 'Mauro core group (Fake Org 3)',
//       isDeleted: false,
//     },
//   ];
//
//   organisationMembers: OrganisationMember[] = [
//     {
//       id: '5be65c1e-d937-46da-a46c-926d5664dcb6',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       createdBy: this.adminUsers[0].id,
//       organisationId: this.organisations[0].id,
//       userId: this.researchUsers[0].id,
//       role: 'To be done',
//       endDate: new Date('2023-04-30T00:00:00.000Z'),
//     },
//     {
//       id: '99ea18c4-6057-4381-bb6c-405165190a90',
//       createdAt: new Date('2023-04-25T00:00:00.000Z'),
//       createdBy: this.adminUsers[0].id,
//       organisationId: this.organisations[0].id,
//       userId: this.researchUsers[1].id,
//       role: 'To be done',
//       endDate: new Date('2023-04-30T00:00:00.000Z'),
//     },
//   ];
// }
