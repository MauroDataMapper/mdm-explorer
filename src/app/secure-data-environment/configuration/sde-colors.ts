import { Injectable } from '@angular/core';
import { ISdeColors } from 'sde-resources';
import { ThemeService } from 'src/app/shared/theme.service';


@Injectable({ providedIn: 'root' })
export class SdeColors implements ISdeColors {
  constructor(private themeService: ThemeService) {}

  getColor(key: string): string {
    return this.themeService.getColor(key);
  }

  applyAllCss() {
    this.themeService.applyAllCss();
  }
}
