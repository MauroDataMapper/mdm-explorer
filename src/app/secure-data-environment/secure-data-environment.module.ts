import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from 'primeng/api';
import { SdeSignInComponent } from './sde-sign-in/sde-sign-in.component';

@NgModule({
  declarations: [SdeSignInComponent],
  imports: [CoreModule, SharedModule],
  exports: [SdeSignInComponent],
})
export class SecureDataEnvironmentModule {}
