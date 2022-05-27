import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

//reads env variables and exposes a class with them as properties.
@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  readonly apiEndpoint?: string = environment?.apiEndpoint;
  constructor() {}
}
