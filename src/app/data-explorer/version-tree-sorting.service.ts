import { Injectable } from '@angular/core';
import { SimpleModelVersionTree } from '@maurodatamapper/mdm-resources';

@Injectable({
  providedIn: 'root',
})
export class VersionTreeSortingService {
  constructor() {}

  public compareModelVersion =
    () => (a: SimpleModelVersionTree, b: SimpleModelVersionTree) => {
      // Order ascending when not undefined
      if (!a.modelVersion || !b.modelVersion) {
        return 0;
      }

      // Split into parts
      const aParts = a.modelVersion.split('.');
      const bParts = b.modelVersion.split('.');

      // Compare each part
      for (let i = 0; i < aParts.length; i++) {
        if (+aParts[i] > +bParts[i]) {
          return 1;
        }
        if (+aParts[i] < +bParts[i]) {
          return -1;
        }
      }

      // All parts are equal
      return 0;
    };
}
