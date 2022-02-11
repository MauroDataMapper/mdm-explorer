import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { ResetPasswordClickEvent } from 'src/app/security/forgot-password-form/forgot-password-form.component';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  isSending = false;
  emailSent = false;
  emailFailed = false;

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService) { }

  resetPassword(event: ResetPasswordClickEvent) {
    this.isSending = true;

    this.security.sendResetPasswordLink(event.email)
      .pipe(
        finalize(() => this.isSending = false)
      )
      .subscribe(success => {
        this.emailSent = success;
        this.emailFailed = !success;
      });
  }

  cancel() {
    this.stateRouter.transitionTo('app.container.signin');
  }
}
