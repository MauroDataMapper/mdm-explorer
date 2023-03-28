/*
Copyright 2022-2023 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Injectable } from '@angular/core';
import { filter, map, Observable, Subject } from 'rxjs';
import { UserDetails } from '../security/user-details.service';
import { LoadingBroadcastPayload } from './core.types';

export type BroadcastEvent =
  | 'http-application-offline'
  | 'http-not-authorized'
  | 'http-not-found'
  | 'http-not-implemented'
  | 'http-server-timeout'
  | 'http-server-error'
  | 'user-signed-in'
  | 'user-signed-out'
  | 'sign-out-user'
  | 'data-specification-added'
  | 'data-specification-submitted'
  | 'data-intersections-refreshed'
  | 'data-bookmarks-refreshed'
  | 'loading';

/**
 * Represents a message to broadcast with an optional data payload.
 */
export class BroadcastMessage<TPayload = any> {
  constructor(public event: BroadcastEvent, public payload?: TPayload) {}
}

/**
 * Service to broadcast events and data payloads to any other part of the application that subscribes to those events.
 */
@Injectable({
  providedIn: 'root',
})
export class BroadcastService {
  private handler = new Subject<BroadcastMessage<any>>();

  /**
   * Request an observable to subscribe to when a particular {@link BroadcastEvent} occurs.
   *
   * @typedef TPayload The type of the event payload.
   * @param event The broadcast event to watch.
   * @returns An observable to subscribe to for watching for these events.
   *
   * For any observable returned that is subscribed to, each must be correctly unsubscribed from when finished
   * to prevent memory leaks.
   */
  on<TPayload = any>(event: BroadcastEvent): Observable<TPayload> {
    return this.handler.pipe(
      filter((message) => message.event === event),
      map((message) => message.payload)
    );
  }

  /**
   * Dispatch a new event to broadcast to any watchers.
   *
   * @typedef TPayload The type of the event payload.
   * @param event The event to broadcast.
   * @param payload The optional payload that is associated with the event.
   */
  dispatch<TPayload = any>(event: BroadcastEvent, payload?: TPayload) {
    this.handler.next(new BroadcastMessage(event, payload));
  }

  /**
   * Notify that a user has signed in.
   *
   * @param user The details of the signed-in user.
   */
  userSignedIn(user: UserDetails) {
    this.dispatch<UserDetails>('user-signed-in', user);
  }

  /**
   * Get an observable to watch for the `user-signed-in` {@link BroadcastEvent}.
   */
  onUserSignedIn(): Observable<UserDetails> {
    return this.on<UserDetails>('user-signed-in');
  }

  loading(payload: LoadingBroadcastPayload) {
    this.dispatch('loading', payload);
  }

  onLoading(): Observable<LoadingBroadcastPayload> {
    return this.on<LoadingBroadcastPayload>('loading');
  }
}
