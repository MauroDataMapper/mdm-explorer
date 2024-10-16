/*
Copyright 2022-2023 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdeRequestsComponent } from './sde-requests.component';
import { MembershipEndpointsResearcher } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';
import { listenerCount } from 'process';

describe('SdeRequestsComponent', () => {
  let component: SdeRequestsComponent;
  let fixture: ComponentFixture<SdeRequestsComponent>;

  beforeEach(async () => {
    // Create a mock instance using Jasmine spy object
    const mockMembershipEndpointsResearcher = {
      listDepartments: jest.fn(),
      listProjects: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [SdeRequestsComponent],
      providers: [
        { provide: MembershipEndpointsResearcher, useValue: mockMembershipEndpointsResearcher },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SdeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
