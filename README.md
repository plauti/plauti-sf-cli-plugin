# Plauti Salesforce CLI Plugin

This is a plugin for Salesforce SF CLI, that extends its functionality to also be able to use it to interact with Plauti products such as Plauti Deduplicate (formerly known as Duplicate Check).

[![Version](https://img.shields.io/npm/v/plauti-sfdx.svg)](https://npmjs.org/package/plauti-sfdx)
[![License](https://img.shields.io/npm/l/plauti-sfdx.svg)](https://github.com/plauti/plauti-sf-cli-plugin/blob/main/package.json)

## ⚠️ IMPORTANT: Migration from SFDX to SF CLI

- Salesforce has deprecated the SFDX Command Line application in favor of the Salesforce CLI. To properly use our command line plugin, please migrate from SFDX to SF CLI, as recommended by Salesforce.
- Please find the migration instructions here: [Installation instructions SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_move_to_sf_v2.htm)
- If you are currently using SFDX (You are if any of the terminal commands you use start with `sfdx`) please make sure to remove it ([removal instructions](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_uninstall.htm))
- Plauti Salesforce CLI Plugin is compatible with the new Salesforce CLI.

## 🔄 100% Backwards Compatibility Guaranteed

**This plugin maintains full backwards compatibility with existing installations - no scripts will break:**

### Legacy Flag Support
Both old and new flag syntaxes work identically:

```bash
# Legacy syntax (still works, will show deprecation warning)
$ sfdx plauti:duplicatecheck:license:refresh --targetusername myorg@example.com
$ sf plauti:duplicatecheck:config:export -u myorg@example.com --file config.json

# Modern syntax (recommended for new scripts)
$ sf plauti:duplicatecheck:license:refresh --target-org myorg@example.com
$ sf plauti:duplicatecheck:config:export --target-org myorg@example.com --file config.json
```

### Dual Binary Support
All commands work with both `sf` and `sfdx` CLI binaries:

```bash
# Both work identically:
$ sf plauti:duplicatecheck:config:export --target-org myorg
$ sfdx plauti:duplicatecheck:config:export --target-org myorg
```

### Migration Timeline
1. **No immediate action required** - existing scripts continue working unchanged
2. **Gradual migration recommended**:
   - Replace `--targetusername` or `-u` with `--target-org` when convenient
   - Consider using `sf` instead of `sfdx` for new scripts
   - Update CI/CD pipelines at your own pace

## 🛠️ Prerequisites to use Plauti Salesforce CLI Plugin

- Please make sure Node.js 18 or higher is installed on your machine [Downloading NodeJS](https://nodejs.org/en)
- Please make sure SF CLI is installed on your machine [Installing SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
- If you have previously used SFDX (Former CLI, deprecated by Salesforce), please uninstall it [Removing SFDX](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_uninstall.htm)

## Installing Plauti Salesforce CLI Plugin

- Please make sure your machine complies with the above prerequisites before you get started.
- Type the following command in your terminal and hit `Enter`:
  ```bash
  sf plugins install plauti-sfdx
  ```
- You'll see a prompt asking you if you want to install a plugin that is not from Salesforce, since this plugin is maintained by Plauti. Please confirm by typing `y` (for Yes) and hit `Enter`.
- Wait for the installation to complete.

### Common Installation Issues

A common error during installation is `The engine "node" is incompatible with this module.` this means you are not running Node.js 18 or higher. If you did install Node.js 18, you may still have an older version on your machine that is in use. Please remove any older version of node or use a more advanced tool like [NVM](https://github.com/nvm-sh/nvm) to switch between node versions.
After making sure the correct Node version is being used, execute the installation process again.

Or install from source for development:

```bash
git clone https://github.com/plauti/plauti-sf-cli-plugin.git
cd plauti-sf-cli-plugin
npm install
sf plugins link .
```

## Authenticating SF CLI with the desired Salesforce Org

- SF CLI needs to be linked to the Salesforce Org you want to perform any of the Plauti CLI Plugin commands on
- Extensive instructions on how to link a Salesforce Org to SF CLI are provided by Salesforce [SF CLI Login instructions](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_web_flow.htm)

```bash
sf org login web --alias my-org
```

Note: the alias you choose here after the `--alias` parameter, is the same you will use to tell Plauti Salesforce CLI Plugin which org it should use, so pick an alias that you can easily remember and distinguish.
Running the command above will open your browser and ask you to login to the Salesforce org you want to connect to. After logging in, check back in the terminal to see if the login went correctly.

## Plauti CLI Command Reference

After installing the SF CLI, the Plauti Salesforce CLI Plugin, and authenticating SF CLI with a Salesforce org as described above, you are able to make use of the following Plauti CLI commands.

### License Management

#### `sf plauti duplicatecheck license refresh`

Refresh your Plauti Duplicate Check for Salesforce license.

```
USAGE
  $ sf plauti duplicatecheck license refresh [--target-org <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

EXAMPLES
  $ sf plauti duplicatecheck license refresh --target-org myOrg@example.com
  $ sf plauti duplicatecheck license refresh -u myOrg@example.com   # Legacy syntax still works
```

### Configuration Management

#### `sf plauti duplicatecheck config export`

Export Plauti Duplicate Check configuration to a file.

```
USAGE
  $ sf plauti duplicatecheck config export --file <filepath> [--pollinterval <integer>] [--target-org <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --file=file                                                                      (required) Export file path and name

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --pollinterval=pollinterval                                                      [default: 3] Poll interval in
                                                                                   seconds

EXAMPLES
  $ sf plauti duplicatecheck config export --target-org myOrg@example.com --file ./export/test_config.json
  $ sf plauti duplicatecheck config export --target-org myOrg@example.com --file ./export/test_config.json --pollinterval 10
  $ sf plauti duplicatecheck config export -u myOrg@example.com --file ./export/test_config.json   # Legacy syntax
```

#### `sf plauti duplicatecheck config import`

Import Plauti Duplicate Check configuration from a file.

```
USAGE
  $ sf plauti duplicatecheck config import --file <filepath> [--pollinterval <integer>] [--target-org <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --file=file                                                                      (required) File path

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --pollinterval=pollinterval                                                      [default: 3] Poll interval in
                                                                                   seconds

EXAMPLES
  $ sf plauti duplicatecheck config import --target-org myOrg@example.com --file ./export/test_config.json
  $ sf plauti duplicatecheck config import --target-org myOrg@example.com --file ./export/test_config.json --pollinterval 10
  $ sf plauti duplicatecheck config import -u myOrg@example.com --file ./export/test_config.json   # Legacy syntax
```

### Data Processing

#### `sf plauti duplicatecheck csv tojob`

Create a Plauti Duplicate Check job from a CSV file containing potential duplicates.

```
USAGE
  $ sf plauti duplicatecheck csv tojob --file <filepath> --sourceobject <string> --matchobject <string> 
  [--setmasterformerge] [--delimiter <string>] [--target-org <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --delimiter=delimiter                                                            [default: ,] Csv Delimiter

  --file=file                                                                      (required) Csv file path

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --matchobject=matchobject                                                        (required) Match Object Prefix

  --setmasterformerge                                                              Set Master record for Merge

  --sourceobject=sourceobject                                                      (required) Source Object Prefix

EXAMPLES
  $ sf plauti duplicatecheck csv tojob --target-org myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001
  $ sf plauti duplicatecheck csv tojob --target-org myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge
  $ sf plauti duplicatecheck csv tojob -u myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001   # Legacy syntax
```

**CSV Format:**
```csv
master,duplicate
0011234567890123,0011234567890456
0011234567890123,0011234567890789
```

### Sandbox Management

#### `sf plauti duplicatecheck sandbox link`

Link a sandbox organization to production for license sharing.

```
USAGE
  $ sf plauti duplicatecheck sandbox link --sandboxname <string> --plauticloudapikey <string> [--organizationid 
  <string>] [--sandboxusername <string>] [--target-org <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --organizationid=organizationid                                                  Sandbox Organization Id

  --plauticloudapikey=plauticloudapikey                                            (required) Plauti Cloud Api Key

  --sandboxname=sandboxname                                                        (required) Sandbox Name

  --sandboxusername=sandboxusername                                                Sandbox User Name

EXAMPLES
  $ sf plauti duplicatecheck sandbox link --target-org myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox link --target-org myOrg@example.com --sandboxusername scratch_org_1 --sandboxname mysandbox --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox link -u myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox --plauticloudapikey plauti_123_123456   # Legacy syntax
```

#### `sf plauti duplicatecheck sandbox list`

List all linked sandbox organizations.

```
USAGE
  $ sf plauti duplicatecheck sandbox list --plauticloudapikey <string> [--target-org <string>] [--apiversion <string>] 
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --plauticloudapikey=plauticloudapikey                                            (required) Plauti Cloud Api Key

EXAMPLES
  $ sf plauti duplicatecheck sandbox list --target-org myOrg@example.com --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox list -u myOrg@example.com --plauticloudapikey plauti_123_123456   # Legacy syntax
```

#### `sf plauti duplicatecheck sandbox unlink`

Unlink a sandbox from the production organization.

```
USAGE
  $ sf plauti duplicatecheck sandbox unlink --plauticloudapikey <string> [--organizationid <string>] 
  [--sandboxusername <string>] [--target-org <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --target-org=target-org                                                          username or alias for the target org

  --apiversion=apiversion                                                          override the api version used for
                                                                                   api requests made by this command

  --json                                                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL) [default: warn] logging level for
                                                                                   this command invocation

  --organizationid=organizationid                                                  Sandbox Organization Id

  --plauticloudapikey=plauticloudapikey                                            (required) Plauti Cloud Api Key

  --sandboxusername=sandboxusername                                                Sandbox User Name

EXAMPLES
  $ sf plauti duplicatecheck sandbox unlink --target-org myOrg@example.com --organizationid 00DR0000001ossaMAA --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox unlink --target-org myOrg@example.com --sandboxusername scratch_org_1 --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox unlink -u myOrg@example.com --organizationid 00DR0000001ossaMAA --plauticloudapikey plauti_123_123456   # Legacy syntax
```

## Development

### Prerequisites

- Node.js 24.0.0+
- npm 10+

### Setup

```bash
git clone https://github.com/plauti/plauti-sf-cli-plugin.git
cd plauti-sf-cli-plugin
npm install
```

### Building

```bash
npm run build
```

### Testing

This plugin uses Node.js native testing with zero external dependencies:

```bash
# Run tests
npm test

# Run tests with coverage  
npm test

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Linking for Development

```bash
sf plugins link .
```

## Architecture

### Modern Stack (v0.1.0+)

This plugin has been modernized with:

- **Node.js 24 LTS** - Latest LTS with native TypeScript support
- **Salesforce CLI v2** - Modern `@salesforce/sf-plugins-core` architecture
- **Native Testing** - Zero external testing dependencies using `node:test`
- **ESLint** - Modern linting replacing deprecated TSLint
- **Minimal Dependencies** - Only essential dependencies for security and performance

### Commands Architecture

All commands extend `SfCommand` from `@salesforce/sf-plugins-core` and follow these patterns:

1. **Simple API Commands** - Direct REST API calls (license refresh)
2. **Async Job Commands** - Submit job + polling mechanism (config import/export)
3. **Complex Processing** - Multi-step operations with bulk data handling (CSV to job)
4. **External API Integration** - Plauti Cloud API calls (sandbox management)

### Backwards Compatibility Implementation

This plugin implements comprehensive backwards compatibility through:

- **Dual Flag Support** - Both `--target-org` (modern) and `--targetusername`/`-u` (legacy) flags
- **Dual Binary Support** - Works with both `sf` and `sfdx` CLI binaries
- **Command Structure Preservation** - Maintains colon-separated topic structure (`plauti:duplicatecheck:*`)
- **API Endpoint Consistency** - Same REST API endpoints ensure identical behavior
- **Comprehensive Test Coverage** - 77 backwards compatibility tests validate all scenarios

## Support

- [Plauti Documentation](https://sdk.plauti.com/docs/plauti-cli-transfering-duplicate-check-configuration)
