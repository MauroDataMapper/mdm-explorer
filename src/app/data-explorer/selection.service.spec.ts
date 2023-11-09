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
import { Uuid } from '@maurodatamapper/mdm-resources';
import { firstValueFrom } from 'rxjs';
import { DataElementSearchResult } from './data-explorer.types';
import { SelectionService } from './selection.service';

const sortDataElementSearchResults = (
  a: DataElementSearchResult,
  b: DataElementSearchResult,
) => (a.id < b.id ? -1 : b.id < a.id ? 1 : 0);

describe('SelectionService', () => {
  let service: SelectionService;

  beforeEach(() => {
    service = new SelectionService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('basic store and recall, set semantics', () => {
    beforeEach(() => {
      service.clearSelection();
    });

    test.each([{ input: ['{UUID}'] }, { input: [] }, { input: ['a', 'b', 'c'] }])(
      'should store and recall an array of data elements $#',
      async ({ input }) => {
        const dataElementInstances: DataElementSearchResult[] = input.map(
          (id) =>
            ({
              id: id.toString(),
              label: `Element ${id}`,
            }) as DataElementSearchResult,
        );

        service.add(dataElementInstances);

        const listResponse = await firstValueFrom(service.list$);

        expect(listResponse.sort(sortDataElementSearchResults)).toEqual(
          dataElementInstances.sort(sortDataElementSearchResults),
        );
      },
    );

    test.each([
      { adds: [['a'], ['b'], ['c']], expected: ['a', 'b', 'c'] },
      { adds: [['a', 'b', 'c'], []], expected: ['a', 'b', 'c'] },
      {
        adds: [
          ['a', 'b', 'c'],
          ['b', 'd'],
        ],
        expected: ['a', 'b', 'c', 'd'],
      },
    ])('should combine adds with set union semantics $#', async ({ adds, expected }) => {
      adds.forEach((input) => {
        const dataElementInstances: DataElementSearchResult[] = input.map(
          (id) =>
            ({
              id: id.toString(),
              label: `Element ${id}`,
            }) as DataElementSearchResult,
        );

        service.add(dataElementInstances);
      });

      const listResponse = await firstValueFrom(service.list$);
      expect(listResponse.map((e) => e.id).sort()).toEqual(expected.sort());
    });

    test.each([
      { initial: ['a', 'b', 'c'], removes: [[]], expected: ['a', 'b', 'c'] },
      { initial: ['a', 'b', 'c'], removes: [['a'], ['c', 'd']], expected: ['b'] },
      { initial: ['a', 'b', 'c'], removes: [['c'], ['a'], ['b']], expected: [] },
    ])(
      'should combine removes with set difference semantics $#',
      async ({ initial, removes, expected }) => {
        const initialElements: DataElementSearchResult[] = initial.map(
          (id) =>
            ({
              id: id.toString(),
              label: `Element ${id}`,
            }) as DataElementSearchResult,
        );

        service.add(initialElements);

        removes.forEach((input) => {
          service.remove(input);
        });

        const listResponse = await firstValueFrom(service.list$);
        expect(listResponse.map((e) => e.id).sort()).toEqual(expected.sort());
      },
    );
  });

  describe('set is shared between instances', () => {
    beforeEach(() => {
      service.clearSelection();
    });

    it('should retain value between sets after add', async () => {
      const addList: DataElementSearchResult[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ] as DataElementSearchResult[];

      service.add(addList);

      const newService = new SelectionService();
      const listResponse = await firstValueFrom(newService.list$);
      expect(listResponse.sort(sortDataElementSearchResults)).toEqual(
        addList.sort(sortDataElementSearchResults),
      );
    });

    it('should retain value between sets after remove', async () => {
      const addList: DataElementSearchResult[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ] as DataElementSearchResult[];

      service.add(addList);

      const removeList: Uuid[] = ['b'];

      service.remove(removeList);

      const expected: DataElementSearchResult[] = [
        { id: 'a', label: 'a' },
      ] as DataElementSearchResult[];

      const newService = new SelectionService();
      const listResponse = await firstValueFrom(newService.list$);
      expect(listResponse.sort(sortDataElementSearchResults)).toEqual(
        expected.sort(sortDataElementSearchResults),
      );
    });

    it('should retain value between sets after clear', async () => {
      const addList: DataElementSearchResult[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ] as DataElementSearchResult[];

      service.add(addList);

      service.clearSelection();

      const newService = new SelectionService();
      const listResponse = await firstValueFrom(newService.list$);
      expect(listResponse).toEqual([]);
    });
  });
});
