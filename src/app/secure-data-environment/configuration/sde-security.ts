import { Injectable } from '@angular/core';
import { ISdeSecurity, SignedInUserDetails } from 'sde-resources';
import { SecurityService } from 'src/app/security/security.service';

@Injectable({ providedIn: 'root' })
export class SdeSecurity implements ISdeSecurity {
  constructor(private securityService: SecurityService) {}

  getSignedInUser() {
    const securityDetails = this.securityService.getSignedInUser();
    if (securityDetails) {
      return {
        id: securityDetails.id,
        firstName: securityDetails.firstName,
        lastName: securityDetails.lastName,
        email: securityDetails.email,
        role: securityDetails.role,
        token: securityDetails.sdeAuthToken,
      } as SignedInUserDetails;
    }
    return null;
  }
}
