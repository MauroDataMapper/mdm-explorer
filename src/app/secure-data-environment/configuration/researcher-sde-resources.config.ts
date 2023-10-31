import { Injectable } from '@angular/core';
import { SdeResourcesConfig, SdeResourcesMode } from '@maurodatamapper/sde-resources';
import { SdeSecurity } from './sde-security';
import { SdeColors } from './sde-colors';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ResearcherSdeResourcesConfig implements SdeResourcesConfig {
  sdeSecurity = this.researcherSdeSecurity;
  sdeResourcesMode = SdeResourcesMode.RESEARCHER;
  colors = this.sdeColors;
  sdeEndpoint = environment.sdeResearcherEndpoint;

  constructor(private researcherSdeSecurity: SdeSecurity, private sdeColors: SdeColors) {}
}
