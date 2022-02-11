import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { defaultEmailPattern } from '../security.types';

export interface ResetPasswordClickEvent {
  email: string;
}

@Component({
  selector: 'mdm-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss']
})
export class ForgotPasswordFormComponent implements OnInit, OnChanges {
  @Input() isSending = false;

  @Input() linkSent = false;

  @Input() linkFailed = false;

  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';

  @Input() emailPattern?: RegExp;

  @Input() cancelLabel = 'Cancel';

  @Output() resetPasswordClicked = new EventEmitter<ResetPasswordClickEvent>();

  @Output() cancelClicked = new EventEmitter<void>();

  resetForm!: FormGroup;

  get email() {
    return this.resetForm.get('email');
  }

  ngOnInit(): void {
    this.resetForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,  // eslint-disable-line @typescript-eslint/unbound-method
        Validators.pattern(this.emailPattern ?? defaultEmailPattern)
      ])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isSending !== undefined && this.resetForm) {
      if (this.isSending) {
        this.resetForm.disable();
      }
      else {
        this.resetForm.enable();
      }
    }
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      return;
    }

    this.resetPasswordClicked.emit({ email: this.email?.value });
  }

  cancel() {
    this.cancelClicked.emit();
  }
}
