import { Uuid } from '@maurodatamapper/mdm-resources';

export interface SdeOpenIdConnectProvider {
  name: string;
  label: string;
  imageUrl?: string;
}

export const sdeOpenIdConnectProviders: SdeOpenIdConnectProvider[] = [
  {
    name: 'microsoft-azure',
    label: 'Microsoft',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/256px-Microsoft_logo.svg.png',
  },
  {
    name: 'keycloak',
    label: 'Keycloak',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Keycloak_Logo.png',
  },
];

export interface SdeResearchUser {
  id: Uuid;
  createdAt?: Date;
  email: string;
  mauroCoreUser?: string;
  isDeleted: boolean;
  oidcIssuingAuthority?: string;
  oidcSubject?: string;
  preferredName?: string;
  // preferredContactDetails?: string;
  // shortBio?: string;
  // vettingProcessDetails?: string;
}
