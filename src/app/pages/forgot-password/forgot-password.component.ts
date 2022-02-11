import { Component, OnInit } from '@angular/core';
import { StateRouterService } from 'src/app/core/state-router.service';
import { ResetPasswordClickEvent } from 'src/app/security/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'mdm-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  isSending = false;

  constructor(private stateRouter: StateRouterService) { }

  resetPassword(event: ResetPasswordClickEvent) {

  }

  cancel() {
    this.stateRouter.transitionTo('app.container.signin');
  }
}
