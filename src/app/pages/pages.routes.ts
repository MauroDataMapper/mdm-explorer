/*
Copyright 2022 University of Oxford
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
import { Ng2StateDeclaration } from '@uirouter/angular';
import { StaticContentComponent } from './static-content/static-content.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { BrowseComponent } from './browse/browse.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { CatalogueSearchComponent } from './catalogue-search/catalogue-search.component';

const staticContentStateName = 'app.container.static-content';

/**
 * Build a new router state designed to render static content to a view.
 *
 * @param name The name to give to the router state.
 * @param url The URL to map to the router state.
 * @param path The path to the static content to fetch.
 * @returns An {@link Ng2StateDeclaration} containing the router state information.
 */
export const buildStaticContentState = (
  name: string,
  url: string,
  path: string
): Ng2StateDeclaration => {
  return {
    name,
    url,
    component: StaticContentComponent,
    params: {
      path,
    },
    data: {
      allowAnonymous: true,
    },
  };
};

export const states: Ng2StateDeclaration[] = [
  /*
    Router state for any generic static page content.
    Loads HTML from the 'assets' folder. The {path:any} variable can be either a root URL path or sub-folder path e.g.

    /page/about
    /page/help/faq
    /page/top/middle/bottom

    etc

    Note: the {path} URL parameter sets `raw` as `true` so that forward slashes do not have to be URL encoded.
    /
  */
  {
    name: staticContentStateName,
    url: '/page/:path',
    component: StaticContentComponent,
    params: {
      path: {
        type: 'string',
        raw: true,
      },
    },
    data: {
      allowAnonymous: true,
    },
  },
  buildStaticContentState('app.container.home', '/home', 'home'),
  buildStaticContentState('app.container.about', '/about', 'about'),
  {
    name: 'app.container.signin',
    url: '/sign-in',
    component: SignInComponent,
    data: {
      allowAnonymous: true,
    },
  },
  {
    name: 'app.container.forgot-password',
    url: '/forgot-password',
    component: ForgotPasswordComponent,
    data: {
      allowAnonymous: true,
    },
  },
  {
    name: 'app.container.browse',
    url: '/browse',
    component: BrowseComponent,
  },
  {
    name: 'app.container.search-results',
    url: '/search/results?searchTerms',
    component: SearchResultsComponent,
  },
  {
    name: 'app.container.my-account',
    url: '/account',
    component: MyAccountComponent,
  },
  {
    name: 'app.container.my-bookmarks',
    url: '/bookmarks',
    component: BookmarkComponent,
  },
  {
    name: 'app.container.catalogue-search',
    url: '/search',
    component: CatalogueSearchComponent,
  },
];
