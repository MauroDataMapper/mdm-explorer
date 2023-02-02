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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import {
  CatalogueItemDomainType,
  MdmResourcesConfiguration,
} from '@maurodatamapper/mdm-resources';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  DataClassWithElements,
  DataElementSearchResult,
  DataItemDeleteEvent,
} from '../data-explorer.types';

import { DataClassRowComponent } from './data-class-row.component';

describe('DataClassRowComponent', () => {
  let harness: ComponentHarness<DataClassRowComponent>;

  const dialogStub = createMatDialogStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataClassRowComponent, {
      providers: [
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
        {
          provide: MdmResourcesConfiguration,
          useValue: mdmResourcesConfiguration,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataClassWithElements).toBeUndefined();
  });

  it('should not raise a classCheckedEvent when checked but has no data class', () => {
    const emitSpy = jest.spyOn(harness.component.classCheckedEvent, 'emit');
    const event = {} as MatCheckboxChange;
    harness.component.classChecked(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'should raise a classCheckedEvent when has a data class and checked is %p',
    (checked) => {
      const emitSpy = jest.spyOn(harness.component.classCheckedEvent, 'emit');
      const event = { checked } as MatCheckboxChange;

      const dataClassWithElements: DataClassWithElements = {
        dataClass: {
          label: 'test',
          domainType: CatalogueItemDomainType.DataClass,
        },
        dataElements: [],
      };

      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.classChecked(event);

      expect(emitSpy).toHaveBeenCalled();
    }
  );

  /* This code should be restored when further tests are written.

  it('should raise a deleteEvent when "Remove" button is clicked', () => {
    const component = harness.component;
    const emitSpy = jest.spyOn(component.deleteClass, 'emit');
    const dom = harness.fixture.debugElement;
    harness.detectChanges();
    const button: DebugElement = dom.query(
      (de) => de.name === 'button' && de.nativeElement.click === 'removeClass'
    );

    const dataClassWithElements: DataClassWithElements = {
      dataClass: {
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
      },
      dataElements: [],
    };

    const event: DataClassDeleteEvent = {
      dataClassWithElements: dataClassWithElements, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };

    harness.component.dataClassWithElements = dataClassWithElements;

    button.triggerEventHandler('click', event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });
  */
});

describe('DataClassRowComponent mdm-data-element-row', () => {
  let harness: ComponentHarness<DataClassRowComponent>;
  let dataClassWithElements: DataClassWithElements;

  const dialogStub = createMatDialogStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataClassRowComponent, {
      providers: [
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
        {
          provide: MdmResourcesConfiguration,
          useValue: mdmResourcesConfiguration,
        },
      ],
    });

    dataClassWithElements = {
      dataClass: {
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
      },
      dataElements: [
        {
          isSelected: false,
          id: '1',
          model: 'test',
          dataClass: 'test',
          label: 'test',
          isBookmarked: false,
        },
      ],
    };
  });

  it('should raise a setRemoveSelectedButtonDisabledEvent when mdm-data-element-row emits a SetRemoveSelectedButtonDisabledEvent event', () => {
    const component = harness.component;
    harness.component.dataClassWithElements = dataClassWithElements;

    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const mdmDataElementRowComponent = dom.query(
      (de) => de.name === 'mdm-data-element-row'
    );
    const emitSpy = jest.spyOn(component.setRemoveSelectedButtonDisabledEvent, 'emit');
    mdmDataElementRowComponent.triggerEventHandler(
      'setRemoveSelectedButtonDisabledEvent',
      {}
    );
    expect(emitSpy).toHaveBeenCalledWith();
  });

  it('should raise a requestAddDelete when mdm-data-element-row emits a RequestElementAddDeleteEvent event', () => {
    const component = harness.component;
    harness.component.dataClassWithElements = dataClassWithElements;

    harness.component.sourceTargetIntersections = {
      dataAccessRequests: [
        {
          id: 'Access Request Id',
          label: 'My Request',
          domainType: CatalogueItemDomainType.DataModel,
        },
      ],
      sourceTargetIntersections: [
        {
          sourceDataModelId: 'DataModelId',
          targetDataModelId: 'Access Request Id',
          intersects: ['Id'],
        },
      ],
    };

    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const mdmDataElementRowComponent = dom.query(
      (de) => de.name === 'mdm-data-element-row'
    );
    const emitSpy = jest.spyOn(component.requestAddDelete, 'emit');
    const event: RequestElementAddDeleteEvent = {
      adding: false,
      dataModel: {
        label: '',
        domainType: CatalogueItemDomainType.DataModel,
      },
      dataElement: {
        id: '1',
        model: 'test',
        dataClass: 'test',
        label: 'test',
        isBookmarked: false,
      },
    };
    mdmDataElementRowComponent.triggerEventHandler('requestAddDelete', event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should raise a deleteEvent when mdm-data-element-row emits a delete event.', () => {
    const component = harness.component;
    harness.component.dataClassWithElements = dataClassWithElements;

    const item: DataElementSearchResult = {
      id: '1',
      label: 'test',
      breadcrumbs: [],
      dataClass: 'test',
      model: 'test',
      isSelected: false,
      isBookmarked: false,
    };

    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const mdmDataElementRowComponent = dom.query(
      (de) => de.name === 'mdm-data-element-row'
    );
    const emitSpy = jest.spyOn(component.deleteItemEvent, 'emit');
    const triggerEvent: DataItemDeleteEvent = {
      dataElement: item,
    };
    const expectedEvent: DataItemDeleteEvent = {
      dataClassWithElements,
      dataElement: item,
    };
    mdmDataElementRowComponent.triggerEventHandler('deleteItemEvent', triggerEvent);
    expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
  });
});
