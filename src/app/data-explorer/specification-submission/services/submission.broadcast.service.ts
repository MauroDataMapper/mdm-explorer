import { Injectable } from '@angular/core';
import { BroadcastService } from 'src/app/core/broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class SubmissionBroadcastService {
  constructor(private broadcastService: BroadcastService) {}

  broadcast(message: string) {
    this.broadcastService.loading({
      isLoading: true,
      caption: `Submitting your data specification - ${message}`,
    });
  }
}
