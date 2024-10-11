This document will cover the setup and configuration required to have the Secure Data Environment User Portal function with your backend Mauro instance.

# mdm-plugin-explorer

It is essential to install the [mdm-plugin-explorer](https://github.com/MauroDataMapper-Plugins/mdm-plugin-explorer) Mauro plugin to your backend instance. Refer to the README of that plugin for steps on adding it to your instance.

# Configuration Keys

The [mdm-plugin-explorer](https://github.com/MauroDataMapper-Plugins/mdm-plugin-explorer) will automatically install the following API property keys, which are required for the Secure Data Environment User Portal to function:

- `explorer.config.root_data_model_path`
- `explorer.config.root_data_specification_folder`
- `explorer.config.root_template_folder`
- `explorer.config.profile_namespace`
- `explorer.config.profile_service_name`

> Note: these API properties are publicly accessible and do not require authentication.

All of these keys will be pre-populated with suitable defaults, except for `explorer.config.root_data_model_path` which you must define yourself. This is the direct path, using Mauro path syntax, to the [root data model](./CONCEPTS.md#root-data-model) that will act as the entire catalogue to view within Secure Data Environment User Portal. Some examples of paths could be:

1. A data model "catalogue" in a folder called "explorer" - `fo:explorer|dm:catalogue`
2. A data model under multiple sub-folders - `fo:explorer|fo:sub folder|dm:catalogue`
3. etc

The remaining default configuration values can also be changed if required.

> Note: For further configuration keys relating to emails, refer to the [mdm-plugin-explorer](https://github.com/MauroDataMapper-Plugins/mdm-plugin-explorer) README.

# Root Data Model

The [data model](./CONCEPTS.md#root-data-model) you choose to act as the root of your Secure Data Environment User Portal catalogue needs to have user/group access configured to be "Readable by authenticated users". Refer to the documentation on [managing user and group access](https://maurodatamapper.github.io/user-guides/permissions/permissions/#5-manage-user-and-group-access) for further details.

# User Accounts

Currently, the Mauro Data Mapper does not have the functionality to self-register new user accounts. Instead, administrators of your Mauro instance must create accounts on behalf of the users, then each user will sign-in with their email address and provided password. See [Manage users](https://maurodatamapper.github.io/user-guides/admin-functionality/admin-functionality/#4-manage-users) for how to do this.

When creating user accounts, ensure that they are assigned to the [reader](https://maurodatamapper.github.io/user-guides/permissions/permissions/#reader) access level to prevent the Secure Data Environment User Portal users from making unintentional modifications to the catalogue.
