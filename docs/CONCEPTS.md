This document will explain some of the high-level concepts you will need to understand that the Mauro Data Explorer uses.

# Root Data Model

The Mauro Data Catalogue makes the assumption that you have one, curated data model in your Mauro instance which will act as the _root_ of your Mauro Data Explorer catalogue. When deciding on, or curating, your data model, bear in mind the following:

1. The data model should be a _data asset_.
2. It should be made available to _authenticated users only_.
3. It should be organised into 2 levels of data classes:
   1. Data classes directly under the data model represent _schemas_.
   2. Child data classes under each data class represent _data classes_.
4. At the lowest data class level, every data class then contains one or more _data
   elements_. These are the searchable entities within the Mauro Data Explorer.

## Data Elements

Individual [data elements](https://maurodatamapper.github.io/glossary/data-element/data-element/) are the key entity that users of the Mauro Data Explorer are interested in, representing the _data points_ for the data sets they are researching for. They will provide:

1. A label and (optional) description.
2. Summary metadata, if available. This will assist the users in identifying which data points are relevant based on distribution graphs.
3. Additional metadata tied to the "Mauro Data Explorer - Data Element" profile provided by the [mdm-plugin-explorer](https://github.com/MauroDataMapper-Plugins/mdm-plugin-explorer) profile.

## Profile

The `mdm-plugin-explorer` Mauro plugin exposes this profile automatically:

* **Namespace:** `uk.ac.ox.softeng.maurodatamapper.plugins.explorer.research	
`
* **Name:**: `ResearchDataElementProfileProviderService`
* **Display name:** Mauro Data Explorer - Data Element

Although not essential, it would be beneficial to apply this profile to the data elements in your root data model. This will enhance the user experience of the Mauro Data Explorer by:

1. Highlighting whether any data elements contain any identifying information.
2. Providing additional information for help in choosing appropriate data elements to request for a user's own purposes.
3. Auto-populating the search filters to provide advanced search capabilities.

# User Requests

The primary use case of the Mauro Data Explorer is to:

1. Browse or search the provided catalogue for data elements.
2. Gather data elements of interest to the user into a formal _user request_.
3. Submit this user request to the organisation running this instance to gain access to the real data sets owned by the organisation, based on the data elements requested.

The current implementation considers user requests to be _data models_ in their own right - they are created under the access level of the user signed-in to the Mauro Data Explorer, then populated with data elements before they are submitted. The sections below go into further detail.

## Requests Folder

Every user who signs in to the Mauro Data Explorer will automatically be assigned a folder within the Mauro instance to collect their own requests in one place. This folder is located in Mauro where the `explorer.config.root_request_folder` is defined, which is a [configuration key](SETUP.md#configuration-keys) provided by the `mdm-plugin-explorer`. A root request folder is automatically created by the `mdm-plugin-explorer` called "Explorer Content", though the API property can be changed to any other folder if required.

The user's folder is named after the user's email address for uniqueness.

> **Important:** due to some restrictions in Mauro catalogue item labels, the folder name will not _exactly_ be the same as an email address. This is because the "@" character is reserved for Mauro path syntax.
>
> Therefore, this is automatically replaced with the substring "[at]" instead. For example:
> 
> For a user signed-in with the email address `user@test.com`
>
> The user request folder will be located under `explorer.config.root_request_folder` and named `user[at]test.com`.

This request folder is created along with a new user group containing that user. This group is then assigned to the [editor role](https://maurodatamapper.github.io/user-guides/permissions/permissions/#editor) to allow that user (normally with a read-only role) to create catalogue items underneath it.

Once created, the Mauro instance will contain a set of sub-folders similar to below, assuming the default root request folder is used:

* Explorer Content
    * user1[at]test.com
    * user2[at]test.com
    * etc

## Creating Requests

Each user will automatically create user request data models, usually via another action to also assign data elements to them. The data models created will:

1. Be created directly under their own requests folder.
2. Be accessible only to that user or administrators.
3. Be created as a draft. In the context of the Mauro Data Explorer, these are "unsent" requests which may still be edited.

A user is able to create more than one unsent request at once.

## Copying Data Elements

The signed-in user will be able to copy data elements from the root data model into their own request model. This uses the following Mauro endpoint to accomplish this:

```
PUT api/dataModels/{sourceDataModelId}/subset/{targetDataModelId}

{
  "additions": [
    ...zero or more data element ids
  ]
  "deletions": [
    ...zero or more data element ids
  ]
}
```

The `subset` endpoint is a core Mauro endpoint which allows a deep copy of a set of data elements from a source data model to a target data model. This copy will also maintain the data class structure from the source data model, so the target will end up with:

1. The parent data class, if it does not already exist.
2. The child data class, if it does not already exist.
3. Any related data types from the source data model, if they do not already exist.
4. All requested data elements, stored under the child data class copy.

## Submitting Requests

Once happy with the collection of data elements gathered, the user will be able to submit their request to the organisation hosting the Mauro Data Explorer. Submission covers several areas:

1. The request data model is [finalised](https://maurodatamapper.github.io/user-guides/finalising-data-models/finalising-data-models/).
2. The current implementation of `mdm-plugin-explorer` will email a notification to an administrator.

At this point, the Mauro Data Explorer does not handle the submitted request anymore, the request for data access now falls under the control/responsibility of the hosting organisation.

It is possible for a user to create a new version of a previously submitted request, using the same [versioning](https://maurodatamapper.github.io/user-guides/branch-version-fork/branch-version-fork/) mechanisms that all data models have. This will create a new draft version which can be modified again before being submitted (finalised) a second time.

# Template Requests

Instead of creating User Requests from scratch, it is possible to base a request off of a _template_. This is a pre-made request that is finalised and can be forked to make a copy from.

## Templates Folder

The `mdm-plugin-explorer` will automatically:

1. Bootstrap a folder in Mauro called "Mauro Explorer Templates"
2. Secure this folder to only be read by the "Explorer Readers" user group.
3. Install the API property `explorer.config.root_-_template_folder` pointing to this folder.

This will be the root folder to store any finalised template requests. The Mauro Data Explorer `/templates` page route will list all available templates and allow the user to inspect them and copy from them. Copying involves forking the Data Model request to build the copy, which is then automatically moved to the current user's personal request folder.
