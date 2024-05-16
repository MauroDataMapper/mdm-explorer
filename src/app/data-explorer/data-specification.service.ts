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
import { Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  DataClass,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  ModelUpdatePayload,
  Profile,
  RuleRepresentationPayload,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import {
  FolderDetail,
  SourceTargetIntersection,
  SourceTargetIntersectionPayload,
} from '@maurodatamapper/mdm-resources';
import {
  catchError,
  concatMap,
  toArray,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  throwError,
  from,
} from 'rxjs';
import { UserDetails } from '../security/user-details.service';
import { DataModelService } from '../mauro/data-model.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import {
  DataElementDto,
  DataElementInstance,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataSpecificationQuery,
  dataSpecificationQueryLanguage,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  DataSchema,
  ForkDataSpecificationOptions,
  mapToDataSpecification,
  QueryExpression,
} from './data-explorer.types';
import { DataSpecification } from '../data-explorer/data-explorer.types';
import { DataExplorerService } from './data-explorer.service';
import { SecurityService } from '../security/security.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DataSpecificationCreatedResponse } from './data-specification-created-dialog/data-specification-created-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from '../core/broadcast.service';
import { DialogService } from './dialog.service';
import { RulesService } from '../mauro/rules.service';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { EditDataSpecificationDialogOptions as EditDataSpecificationDialogOptions } from './edit-data-specification-dialog/edit-data-specification-dialog.component';
import { ShareDataSpecificationDialogInputOutput } from './share-data-specification-dialog/share-data-specification-dialog.component';
import { CoreTableProfileService } from './core-table-profile.service';

/**
 * A collection of data specifications and their intersections with target models.
 */
export interface DataSpecificationSourceTargetIntersections {
  dataSpecifications: DataModel[];
  sourceTargetIntersections: SourceTargetIntersection[];
}

@Injectable({
  providedIn: 'root',
})
export class DataSpecificationService {
  constructor(
    private dataModels: DataModelService,
    private catalogueUser: CatalogueUserService,
    private dataExplorer: DataExplorerService,
    private security: SecurityService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private dialogs: DialogService,
    private rules: RulesService,
    private researchPlugin: ResearchPluginService,
    private coreTableProfileService: CoreTableProfileService
  ) {}

  /**
   * Retrieve the users DataSpecification folder, which is assumed to be in local storage.
   *
   * @returns an observable containing a FolderDetail object
   */
  getDataSpecificationFolder(): Observable<FolderDetail> {
    const user = this.security.getSignedInUser();
    return user && user.dataSpecificationFolder ? of(user.dataSpecificationFolder) : EMPTY;
  }

  /**
   * Gets a single data specification as a {@link DataSpecification} object.
   *
   * @param id The unique identifier of the data specification.
   * @returns an observable containing {@link DataSpecification}
   * @throws the underlaying API may return a {@link HttpErrorResponse}
   */
  get(id: Uuid): Observable<DataSpecification> {
    return this.dataModels
      .getDataModelById(id)
      .pipe(map((dataModel) => mapToDataSpecification(dataModel)));
  }

  /**
   * Updates a single data specification using a dialog.
   * In the dialog the user can only update the name
   * and description.
   *
   * @param id The id of the data specification.
   * @returns an observable containing a {@link DataModelDetail} instance
   * with the updated data.
   */
  updateWithDialog(id: Uuid, name: string, description?: string): Observable<DataModelDetail> {
    const user = this.security.getSignedInUser();
    if (!user) return EMPTY;

    const editDataSpecification: EditDataSpecificationDialogOptions = {
      dataSpecificationName: name,
      dataSpecificationDescription: description,
    };

    return this.dialogs
      .openEditDataSpecification(editDataSpecification)
      .afterClosed()
      .pipe(
        // Ensure we have a response.
        filter((response) => !!response),
        // Get data from the dialog and use it to create update data
        // specification payload.
        switchMap((response) => {
          if (!response) return EMPTY;

          this.broadcast.loading({
            isLoading: true,
            caption: 'Updating data specification ...',
          });

          const updatePayload: ModelUpdatePayload = {
            description: response.description,
            label: response.name,
            id,
            domainType: CatalogueItemDomainType.DataModel,
          };

          return this.dataModels.update(id, updatePayload);
        }),
        catchError((error) => {
          this.toastr.error(
            `There was a problem creating updating the data specification. ${error}`,
            'Data specification edition error'
          );
          return EMPTY;
        }),
        finalize(() => {
          this.broadcast.loading({ isLoading: false });
        })
      );
  }

  /**
   * Opens a dialog for the user to set the specification
   * as readable by any authenticated users or not.
   *
   * @param shared whether the {@link DataSpecification} is
   * currently readable by any authenticated users or not.
   * @returns an observable containing a {@link ShareDataSpecificationDialogInputOutput}
   */
  shareWithDialog(shared: boolean): Observable<ShareDataSpecificationDialogInputOutput> {
    const user = this.security.getSignedInUser();
    if (!user) return EMPTY;

    const dialogData: ShareDataSpecificationDialogInputOutput = {
      sharedWithCommunity: shared,
    };

    return this.dialogs
      .shareWithCommunity(dialogData)
      .afterClosed()
      .pipe(
        filter((response: any) => !!response),
        catchError((error) => {
          this.toastr.error(
            `There was a problem sharing the specification. ${error}`,
            'Data specification edition error'
          );
          return EMPTY;
        })
      );
  }

  /**
   * Lists all of the users data specifications as {@link DataSpecification} objects.
   *
   * @returns an observable containing an array of data specifications
   */
  list(): Observable<DataSpecification[]> {
    return this.getDataSpecificationFolder().pipe(
      switchMap((dataSpecificationFolder: FolderDetail): Observable<DataModel[]> => {
        return this.dataModels.listInFolder(dataSpecificationFolder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      map((dataModels) => dataModels.map(mapToDataSpecification))
    );
  }

  /**
   * Lists all of available template data specifications as {@link DataSpecification} objects.
   *
   * @returns an observable containing an array of data specifications
   */
  listTemplates(): Observable<DataSpecification[]> {
    return this.researchPlugin.templateFolder().pipe(
      switchMap((folder: FolderDetail): Observable<DataModel[]> => {
        return this.dataModels.listInFolder(folder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      map((dataModels) => dataModels.map(mapToDataSpecification))
    );
  }

  /**
   * Gets all Data Elements within a given Data Specification, flattened into a single list.
   *
   * @param dataSpecification The {@link DataSpecification} (Data Model) that contains the elements.
   * @returns An observable containing the list of Data Elements.
   */
  listDataElements(dataSpecification: DataSpecification): Observable<DataElementDto[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.dataModels.getDataModelHierarchy(dataSpecification.id!).pipe(
      map((dataModel) => {
        // Flatten every Data Element into one array. Each Data Element will
        // include a breadcrumb to locate where it came from
        const dataClasses = dataModel.childDataClasses ?? [];

        return dataClasses.flatMap((parentDataClass) => {
          const parentElements = parentDataClass.dataElements ?? [];
          const childElements =
            parentDataClass.dataClasses?.flatMap((childDataClass) => {
              return childDataClass.dataElements ?? [];
            }) ?? [];
          return parentElements.concat(childElements);
        });
      })
    );
  }

  /**
   * Deletes multiple data elements from a data specification, calling the delete endpoint once
   * for each element. Using concatMap sidestep backend exceptions
   *
   * @param items: The data elements to be removed
   *
   * @returns: Observable of DataElementMultipleOperationResult
   */
  deleteDataElementMultiple(
    elements: DataElementInstance[],
    targetModel: DataModelDetail
  ): Observable<DataElementMultipleOperationResult> {
    const items: DataElementDto[] = elements.map(
      (dataElementInstance) => dataElementInstance as DataElementDto
    );
    return of(items).pipe(
      switchMap((dataElements: DataElementDto[]) => {
        return this.dataModels.elementsInAnotherModel(targetModel, dataElements);
      }),
      switchMap((dataElements: DataElementDto[]) => from(dataElements)),
      filter((item) => item !== null),
      concatMap((item: DataElementDto) => {
        const dataElementInstance = item as DataElementInstance;
        return this.deleteDataElement(dataElementInstance);
      }),
      toArray(),
      switchMap((results: DataElementOperationResult[]) => {
        const successes: DataElementOperationResult[] = [];
        const failures: DataElementOperationResult[] = [];
        results.forEach((result: DataElementOperationResult) => {
          const destination = result.success ? successes : failures;
          destination.push(result);
        });
        return of({ successes, failures });
      })
    );
  }

  /**
   * Deletes a data element from a data specification
   *
   * @param item: The data element to be removed
   *
   * @returns: Observable of DataElementOperationResult
   */
  deleteDataElement(item: DataElementInstance): Observable<DataElementOperationResult> {
    return this.dataModels.deleteDataElement(item).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200 || response.status === 204) {
          return { success: true, message: 'OK', item };
        } else {
          return { success: false, message: response.body, item };
        }
      }),
      catchError((response: HttpErrorResponse) => {
        return of({ success: false, message: response.message, item });
      })
    );
  }

  /**
   * Creates a new Data Specification for a user.
   *
   * @param user The user to create the data specification for.
   * @param name The name of the new data specification
   * @param description Optional description for the new data specification.
   * @returns An observable containing the new {@link DataSpecification}.
   */
  create(user: UserDetails, name: string, description?: string): Observable<DataSpecification> {
    return forkJoin([this.getDataSpecificationFolder(), this.catalogueUser.get(user.id)]).pipe(
      switchMap(([folder, catalogueUser]) => {
        if (!folder || !folder.id) {
          return throwError(() => new Error('No data specification folder available'));
        }

        const payload: DataModelCreatePayload = {
          label: name,
          description,
          type: 'Data Asset',
          folder: folder.id,
          author: `${user.firstName} ${user.lastName}`,
          organisation: catalogueUser.organisation ?? '',
        };

        return this.dataModels.addToFolder(folder.id, payload);
      }),
      map((dataModel) => {
        return mapToDataSpecification(dataModel);
      })
    );
  }

  /**
   * Deletes multiple data elements from a data specification, calling the delete endpoint once
   * for each element. Using concatMap sidestep backend exceptions
   *
   * @param items: The data elements to be removed
   *
   * @returns: Observable of DataElementMultipleOperationResult
   */
  deleteDataClassMultiple(
    dataClasses: DataClass[]
  ): Observable<DataElementMultipleOperationResult> {
    return of(dataClasses).pipe(
      switchMap((dataClassArray: DataClass[]) => from(dataClassArray)),
      filter((dataClass) => !!dataClass),
      concatMap((dataClass: DataClass) => {
        return this.deleteDataClass(dataClass);
      }),
      toArray(),
      switchMap((results: DataElementOperationResult[]) => {
        const successes: DataElementOperationResult[] = [];
        const failures: DataElementOperationResult[] = [];
        results.forEach((result: DataElementOperationResult) => {
          const destination = result.success ? successes : failures;
          destination.push(result);
        });
        return of({ successes, failures });
      })
    );
  }

  /**
   * Deletes a data class from a data specification
   *
   * @param dataClass: The data class to be removed
   *
   * @returns: Observable of DataElementOperationResult
   */
  deleteDataClass(dataClass: DataClass): Observable<DataElementOperationResult> {
    return this.dataModels.deleteDataClass(dataClass).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200 || response.status === 204) {
          return { success: true, message: 'OK', dataClass };
        } else {
          return { success: false, message: response.body, dataClass };
        }
      }),
      catchError((response: HttpErrorResponse) => {
        return of({ success: false, message: response.message, dataClass });
      })
    );
  }

  /**
   * Deletes multiple data elements from a data specification, calling the delete endpoint once
   * for each element. Using concatMap sidestep backend exceptions
   *
   * @param items: The data elements to be removed
   *
   * @returns: Observable of DataElementMultipleOperationResult
   */
  deleteDataSchemaMultiple(
    dataSchemas: DataSchema[]
  ): Observable<DataElementMultipleOperationResult> {
    return of(dataSchemas).pipe(
      switchMap((dataSchemaArray: DataSchema[]) => from(dataSchemaArray)),
      filter((dataSchema) => dataSchema !== null),
      concatMap((dataSchema: DataSchema) => {
        return this.deleteDataSchema(dataSchema.schema);
      }),
      toArray(),
      switchMap((results: DataElementOperationResult[]) => {
        const successes: DataElementOperationResult[] = [];
        const failures: DataElementOperationResult[] = [];
        results.forEach((result: DataElementOperationResult) => {
          const destination = result.success ? successes : failures;
          destination.push(result);
        });
        return of({ successes, failures });
      })
    );
  }

  /**
   * Deletes a data class from a data specification
   *
   * @param dataClass: The data class to be removed
   *
   * @returns: Observable of DataElementOperationResult
   */
  deleteDataSchema(dataSchema: DataClass): Observable<DataElementOperationResult> {
    return this.dataModels.deleteDataSchema(dataSchema).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200 || response.status === 204) {
          return { success: true, message: 'OK', dataSchema };
        } else {
          return { success: false, message: response.body, dataSchema };
        }
      }),
      catchError((response: HttpErrorResponse) => {
        return of({ success: false, message: response.message, dataSchema });
      })
    );
  }

  /**
   * Given a source data model and list of data elements, get all unsent data specifications and
   * get the intersection of the source with each data specification, for the list of data elements.
   *
   * @param sourceDataModelId
   * @param dataElementIds
   * @returns An Observable containing a {@link DataSpecificationSourceTargetIntersections }
   */
  getDataSpecificationIntersections(
    sourceDataModelId: Uuid,
    dataElementIds: Uuid[]
  ): Observable<DataSpecificationSourceTargetIntersections> {
    const user = this.security.getSignedInUser();

    if (user === null) {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }

    return this.list().pipe(
      map((dataSpecifications: DataSpecification[]) =>
        dataSpecifications.filter((dr) => dr.status === 'unsent')
      ),
      switchMap((dataSpecifications: DataSpecification[]) => {
        const sourceTargetIntersections: DataSpecificationSourceTargetIntersections = {
          dataSpecifications,
          sourceTargetIntersections: [],
        };

        const payload: SourceTargetIntersectionPayload = {
          targetDataModelIds: [],
          dataElementIds,
        };

        dataSpecifications.forEach((dataSpecification: DataSpecification) => {
          if (dataSpecification.id) {
            payload.targetDataModelIds.push(dataSpecification.id);
          }
        });

        return this.dataModels.getIntersectionMany(sourceDataModelId, payload).pipe(
          map((result) => {
            sourceTargetIntersections.sourceTargetIntersections = result.items;
            return sourceTargetIntersections;
          })
        );
      })
    );
  }

  /**
   * Creates an observable that adds a new data model to the user's
   * data specification folder.
   *
   * @param elements The list of data elements to copy.
   * @param user The user to create the data specification for.
   * @param name The name of the new data specification.
   * @param description Optional description for the new data specification.
   * @returns An observable containing the new {@link DataSpecification}.
   */
  createFromDataElements(
    elements: DataElementInstance[],
    user: UserDetails,
    name: string,
    description?: string
  ): Observable<DataSpecification> {
    return forkJoin([
      // TODO: assume there is only one data model, will have to change in future
      this.dataExplorer.getRootDataModel(),
      this.create(user, name, description),
    ]).pipe(
      switchMap(([rootDataModel, dataSpecification]) => {
        if (!rootDataModel || !rootDataModel.id) {
          return throwError(() => new Error('No root data model'));
        }

        if (!dataSpecification || !dataSpecification.id) {
          return throwError(() => new Error('No data specification'));
        }

        return this.copyDataElementsToDataModel(
          rootDataModel,
          rootDataModel.id,
          elements,
          dataSpecification.id
        );
      }),
      switchMap(([rootDataModel, dataSpecification]) => {
        return this.getCoreTableProfile(rootDataModel, dataSpecification);
      }),
      switchMap(([dataSpecification, coreTableProfile]) => {
        return this.saveCoreTableProfile(dataSpecification, coreTableProfile);
      }),
      map(([_, targetDataModel]) => mapToDataSpecification(targetDataModel))
    );
  }

  /**
   * Create a new data specification via a user-interactive process to name the new specification.
   *
   * @param getDataElements A callback function to retrieve the necessary data elements to include in the newly created data specification.
   * @returns An observable returning the {@link DataSpecificationCreatedAction} that the user determined after the data specification was created. If the user
   * cancelled the operation, then nothing further would happen.
   *
   * The callback provided must return an observable of {@link DataElementBasic[]} objects so that they can be passed to the
   * {@link DataSpecificationService.createFromDataElements()} function.
   */
  createWithDialogs(
    getDataElements: () => Observable<DataElementInstance[]>,
    suppressViewDataSpecificationDialogButton: boolean = false
  ): Observable<DataSpecificationCreatedResponse> {
    const user = this.security.getSignedInUser();
    if (!user) return EMPTY;

    return this.dialogs
      .openCreateDataSpecification()
      .afterClosed()
      .pipe(
        // Ensure we have a response.
        filter((response) => !!response),
        // Gather name, description, and elements to be added. And, begin loading spinner.
        switchMap((response) => {
          if (!response) return EMPTY;

          this.broadcast.loading({
            isLoading: true,
            caption: 'Creating new data specification ...',
          });
          return forkJoin([of(response), getDataElements()]);
        }),
        // Attempt to create the dataSpecification using the gathered data.
        switchMap(([response, dataElements]) => {
          return forkJoin([
            this.createFromDataElements(dataElements, user, response.name, response.description),
            of(dataElements),
          ]);
        }),
        catchError((error) => {
          this.toastr.error(
            `There was a problem creating your data specification. ${error}`,
            'Data specification creation error'
          );
          return EMPTY;
        }),
        switchMap(([dataSpecification, dataElements]) => {
          this.broadcast.dispatch('data-specification-added');

          return this.dialogs
            .openDataSpecificationCreated({
              dataSpecification,
              addedElements: dataElements,
              suppressViewDataSpecifications: suppressViewDataSpecificationDialogButton,
            })
            .afterClosed()
            .pipe(
              map((action) => {
                return { dataSpecification, action: action ?? 'continue' };
              })
            );
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      );
  }

  /**
   * Fork a finalised data specification to create a new copy to base further work on. Use an interactive process to name the new specification.
   *
   * @param dataSpecification The original data specification to fork from.
   * @param options Options that may be passed to control the process.
   * @returns An observable returning the new forked {@link DataSpecification}. If the user cancelled the operation, then nothing further would happen.
   */
  forkWithDialogs(dataSpecification: DataSpecification, options?: ForkDataSpecificationOptions) {
    if (
      !dataSpecification ||
      !dataSpecification.id ||
      !dataSpecification.modelVersion ||
      dataSpecification.status !== 'finalised'
    ) {
      return EMPTY;
    }

    return this.dialogs
      .openCreateDataSpecification({ showDescription: false })
      .afterClosed()
      .pipe(
        filter((response) => !!response),
        switchMap((response) => {
          if (!response || !dataSpecification) {
            return EMPTY;
          }

          this.broadcast.loading({
            isLoading: true,
            caption: 'Copying to new data specification ...',
          });

          return this.dataModels.createFork(dataSpecification, { label: response.name });
        }),
        catchError(() => {
          this.toastr.error(
            'There was a problem creating your data specification. Please try again or contact us for support.',
            'Copying error'
          );
          return EMPTY;
        }),
        switchMap((nextDraftModel) => {
          if (options?.targetFolder?.id && nextDraftModel.id) {
            return this.dataModels.moveToFolder(nextDraftModel.id, options.targetFolder.id);
          }

          return of(nextDraftModel);
        }),
        map((nextDraftModel) => mapToDataSpecification(nextDraftModel)),
        map((nextDataSpecification) => {
          this.broadcast.dispatch('data-specification-added');
          this.dialogs.openSuccess({
            heading: 'Data specification copied',
            message: `Your new data specification "${nextDataSpecification.label}" has been successfully created. Modify this data specification by searching or browsing our catalogue before submitting again.`,
          });
          return nextDataSpecification;
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      );
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   *
   * @param userEmail
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  public getDataSpecificationFolderName(userEmail: string): string {
    return userEmail.replace('@', '[at]');
  }

  /**
   * Get a query from a data specification.
   *
   * @param dataSpecificationId The unique identifier of the data specification.
   * @param type The type of query to get.
   * @returns A {@link DataSpecificationQuery} containing the query content, or undefined if one cannot be found.
   */
  getQuery(
    dataSpecificationId: Uuid,
    type: DataSpecificationQueryType
  ): Observable<DataSpecificationQuery | undefined> {
    return this.rules.list('dataModels', dataSpecificationId).pipe(
      map((rules) => {
        const rule = rules.find((r) => r.name === type);
        if (!rule) {
          return undefined;
        }

        const representation = rule?.ruleRepresentations.find(
          (rr) => rr.language === dataSpecificationQueryLanguage
        );
        if (!representation) {
          return undefined;
        }

        return {
          ruleId: rule.id,
          representationId: representation.id,
          type,
          condition: JSON.parse(representation.representation),
        };
      })
    );
  }

  createOrUpdateQuery(
    dataSpecificationId: Uuid,
    payload: DataSpecificationQueryPayload
  ): Observable<DataSpecificationQuery> {
    const rule$ = payload.ruleId
      ? this.rules.get('dataModels', dataSpecificationId, payload.ruleId)
      : this.rules.create('dataModels', dataSpecificationId, { name: payload.type });

    return rule$.pipe(
      catchError(() => {
        this.toastr.error('There was a problem getting the rule for your query.');
        return EMPTY;
      }),
      switchMap((rule) => {
        const representation: RuleRepresentationPayload = {
          language: dataSpecificationQueryLanguage,
          representation: JSON.stringify(payload.condition, null, 2),
        };

        const representation$ = payload.representationId
          ? this.rules.updateRepresentation(
              'dataModels',
              dataSpecificationId,
              rule.id,
              payload.representationId,
              representation
            )
          : this.rules.createRepresentation(
              'dataModels',
              dataSpecificationId,
              rule.id,
              representation
            );

        return forkJoin([of(rule), representation$]);
      }),
      catchError(() => {
        this.toastr.error('There was a problem getting the representation for your query.');
        return EMPTY;
      }),
      map(([rule, representation]) => {
        return {
          ruleId: rule.id,
          representationId: representation.id,
          type: payload.type,
          condition: JSON.parse(representation.representation),
        };
      })
    );
  }

  /**
   * Removes all data labels found in a query attached to a data specification.
   *
   * @param dataSpecificationId The unique identifier of the data specification.
   * @param type The type of query to get.
   * @param dataElementLabels the labels of the data elements to remove from the query.
   * @returns a {@link DataSpecificationQueryPayload} with the query after removing the
   * data elements, or `undefined` if the data specification or query cannot be found.
   */
  deleteDataElementsFromQuery(
    dataSpecificationId: Uuid,
    type: DataSpecificationQueryType,
    dataElementLabels: string[]
  ): Observable<DataSpecificationQueryPayload | undefined> {
    let updatedQuery: DataSpecificationQueryPayload;

    return this.getQuery(dataSpecificationId, type).pipe(
      switchMap((query) => {
        if (!query) {
          return of(undefined);
        }

        updatedQuery = query;

        dataElementLabels.forEach((label) => {
          updatedQuery.condition.rules = query.condition.rules.filter(
            (item) => !(item as QueryExpression)?.field?.startsWith(label)
          );
        });

        return this.createOrUpdateQuery(dataSpecificationId, updatedQuery);
      })
    );
  }

  isDataSpecificationNameAvailable(name: string): Observable<boolean> {
    if (!name) {
      return of(false);
    }

    return this.list().pipe(
      switchMap((dataSpecifications) => {
        if (!dataSpecifications) {
          return of(false);
        }

        return of(!dataSpecifications.some((element) => element.label === name));
      })
    );
  }

  private copyDataElementsToDataModel(
    rootDataModel: DataModel,
    rootDataModelId: Uuid,
    elements: DataElementInstance[],
    dataSpecificationId: Uuid
  ): Observable<[DataModel, DataModelDetail]> {
    return forkJoin([
      of(rootDataModel),
      this.dataModels.copySubset(rootDataModelId, dataSpecificationId, {
        additions: elements.map((de) => de.id),
        deletions: [],
      }),
    ]);
  }

  private getCoreTableProfile(
    rootDataModel: DataModel,
    dataModelDetail: DataModelDetail
  ): Observable<[DataModelDetail, Profile | undefined]> {
    return forkJoin([
      of(dataModelDetail),
      this.coreTableProfileService.getQueryBuilderCoreTableProfile(rootDataModel),
    ]);
  }

  private saveCoreTableProfile(
    dataModelDetail: DataModelDetail,
    coreTableProfile: Profile | undefined
  ): Observable<[Profile | undefined, DataModelDetail]> {
    const $profile = coreTableProfile
      ? this.coreTableProfileService.saveQueryBuilderCoreTableProfile(
          dataModelDetail,
          coreTableProfile
        )
      : of(undefined);
    return forkJoin([$profile, of(dataModelDetail)]);
  }
}
