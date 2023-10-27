import { Observable, map } from 'rxjs';
import {
  SdeOpenIdConnectProvider,
  SdeResearchUser,
  sdeOpenIdConnectProviders,
} from '../resources/authentication.resources';
import { ISdeRestHandler } from '../sde-rest-handler.interface';
import { SdeApiEndPoints } from './endpoints.dictionary';
import { environment } from 'src/environments/environment';

export class AuthenticationEndpoints {
  constructor(private sdeRestHandler: ISdeRestHandler) {}

  listOpenIdConnectProviders(): Observable<SdeOpenIdConnectProvider[]> {
    return this.sdeRestHandler
      .get<string[]>(SdeApiEndPoints.AuthenticationListOpenIdConnectProviders)
      .pipe(
        map((providers) => providers ?? []),
        map((providers) =>
          sdeOpenIdConnectProviders.filter((oidcProvider) =>
            providers.includes(oidcProvider.name)
          )
        )
      );
  }

  getOpenIdConnectAuthorizationUrl(provider: SdeOpenIdConnectProvider): URL {
    // Micronaut backend provides a standard URL route to redirect to
    return new URL(environment.sdeResearcherEndpoint + `/oauth/login/${provider.name}`);
  }

  getSignOutUrl(): string {
    return `${environment.sdeResearcherEndpoint}/logout`;
  }

  getUserDetails(): Observable<SdeResearchUser> {
    return this.sdeRestHandler.get<SdeResearchUser>(
      SdeApiEndPoints.AuthenticationUserDetailsGet
    );
  }
}
