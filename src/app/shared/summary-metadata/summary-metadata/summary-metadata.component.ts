/*
Copyright 2022-2023 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital





    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, Input, OnInit } from '@angular/core';
import { Uuid } from '@maurodatamapper/mdm-resources';
import {
  SummaryMetadata,
  SummaryMetadataService,
} from 'src/app/mauro/summary-metadata.service';

@Component({
  selector: 'mdm-summary-metadata',
  templateUrl: './summary-metadata.component.html',
  styleUrls: ['./summary-metadata.component.scss'],
})
export class SummaryMetadataComponent implements OnInit {
  @Input() catalogueItemDomainType = '';
  @Input() catalogueItemId: Uuid = '';

  summaryMetadata: SummaryMetadata[] = [];

  constructor(private summaryMetadataService: SummaryMetadataService) {}

  ngOnInit(): void {
    this.summaryMetadataService
      .list(this.catalogueItemDomainType, this.catalogueItemId)
      .subscribe((data) => {
        this.summaryMetadata = data.items;
      });
  }
}
