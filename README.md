# Plauti Salesforce CLI Plugin

This is a plugin for Salesforce SF CLI, that extends its functionality to also be able to use it to interact with Plauti products such as Plauti Deduplicate.

## 🎯 Plauti Deduplicate Commands

```bash
$ sf plauti:deduplicate:license:refresh --target-org myorg
$ sf plauti:deduplicate:config:export --target-org myorg --file config.json
$ sf plauti:deduplicate:sandbox:link --target-org myorg --sandbox-name mysandbox --plauti-cloud-api-key key
```

## 🔄 Migrating from Old Plugin?

If you're upgrading from the old `plauti-sfdx` package (which used `plauti:duplicatecheck:*` commands), see our [Migration Guide](MIGRATION-GUIDE.md) for a complete transition guide.

[![Version](https://img.shields.io/npm/v/plauti-sf-cli-plugin.svg)](https://npmjs.org/package/plauti-sf-cli-plugin)
[![License](https://img.shields.io/npm/l/plauti-sf-cli-plugin.svg)](https://github.com/plauti/plauti-sf-cli-plugin/blob/master/package.json)

## ⚠️ IMPORTANT: SF CLI Required

- This plugin requires Salesforce SF CLI. 
- Please find the installation instructions here: [Installation instructions SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

## 🛠️ Prerequisites to use Plauti Salesforce CLI Plugin

- Please make sure Node.js 24 or higher is installed on your machine [Downloading NodeJS](https://nodejs.org/en)
- Please make sure SF CLI is installed on your machine [Installing SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

## Installing Plauti Salesforce CLI Plugin

- Please make sure your machine complies with the above prerequisites before you get started.
- Type the following command in your terminal and hit `Enter`:
  ```bash
  sf plugins install plauti-sf-cli-plugin
  ```
- You'll see a prompt asking you if you want to install a plugin that is not from Salesforce, since this plugin is maintained by Plauti. Please confirm by typing `y` (for Yes) and hit `Enter`.
- Wait for the installation to complete.

### Common Installation Issues

A common error during installation is `The engine "node" is incompatible with this module.` this means you are not running Node.js 24 or higher. If you did install Node.js 24, you may still have an older version on your machine that is in use. Please remove any older version of node or use a more advanced tool like [NVM](https://github.com/nvm-sh/nvm) to switch between node versions.
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

Commands accept either `:` or a space between topic parts, so `sf plauti:deduplicate:license:refresh` and `sf plauti deduplicate license refresh` are the same command. Every command also accepts `--help`.

### License Management

#### `sf plauti:deduplicate:license:refresh`

Refresh your Plauti Deduplicate for Salesforce license.

```
USAGE
  $ sf plauti:deduplicate:license:refresh -o <value> [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>  (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --verbose             Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:license:refresh --target-org myOrg@example.com
```

### Configuration Management

#### `sf plauti:deduplicate:config:export`

Export Plauti Deduplicate configuration to a file.

```
USAGE
  $ sf plauti:deduplicate:config:export -o <value> --file <value> [--poll-interval <value>] [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>     (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --file=<value>           (required) Export file path and name
      --poll-interval=<value>  [default: 3] Poll interval in seconds
      --verbose                Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:config:export --target-org myOrg@example.com --file ./export/test_config.json
  $ sf plauti:deduplicate:config:export --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10
```

#### `sf plauti:deduplicate:config:import`

Import Plauti Deduplicate configuration from a file.

```
USAGE
  $ sf plauti:deduplicate:config:import -o <value> --file <value> [--poll-interval <value>] [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>     (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --file=<value>           (required) File path
      --poll-interval=<value>  [default: 3] Poll interval in seconds
      --verbose                Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:config:import --target-org myOrg@example.com --file ./export/test_config.json
  $ sf plauti:deduplicate:config:import --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10
```

### Data Processing

#### `sf plauti:deduplicate:csv:tojob`

Create a Plauti Deduplicate job from a CSV file containing potential duplicates.

```
USAGE
  $ sf plauti:deduplicate:csv:tojob -o <value> --file <value> --source-object <value> --match-object <value> [--set-master-for-merge] [--delimiter <value>] [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>     (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --file=<value>           (required) Csv file path
      --source-object=<value>  (required) Source Object Prefix
      --match-object=<value>   (required) Match Object Prefix
      --set-master-for-merge   Set Master record for Merge
      --delimiter=<value>      [default: ,] Csv Delimiter
      --verbose                Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:csv:tojob --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001
  $ sf plauti:deduplicate:csv:tojob --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001 --set-master-for-merge
```

**CSV Format:**
```csv
master,duplicate
0011234567890123,0011234567890456
0011234567890123,0011234567890789
```

### Sandbox Management

#### `sf plauti:deduplicate:sandbox:link`

Link a sandbox organization to production for license sharing.

```
USAGE
  $ sf plauti:deduplicate:sandbox:link -o <value> --sandbox-name <value> --plauti-cloud-api-key <value> [--organization-id <value>] [--sandbox-username <value>] [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>            (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --organization-id=<value>       Sandbox Organization Id
      --sandbox-username=<value>      Sandbox User Name
      --sandbox-name=<value>          (required) Sandbox Name
      --plauti-cloud-api-key=<value>  (required) Plauti Cloud Api Key
      --verbose                       Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:sandbox:link --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456
  $ sf plauti:deduplicate:sandbox:link --target-org myOrg@example.com --sandbox-username scratch_org_1 --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456
```

#### `sf plauti:deduplicate:sandbox:list`

List all linked sandbox organizations.

```
USAGE
  $ sf plauti:deduplicate:sandbox:list -o <value> --plauti-cloud-api-key <value> [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>            (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --plauti-cloud-api-key=<value>  (required) Plauti Cloud Api Key
      --verbose                       Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:sandbox:list --target-org myOrg@example.com --plauti-cloud-api-key plauti_123_123456
```

#### `sf plauti:deduplicate:sandbox:unlink`

Unlink a sandbox from the production organization.

```
USAGE
  $ sf plauti:deduplicate:sandbox:unlink -o <value> --organization-id <value> --plauti-cloud-api-key <value> [--verbose] [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>            (required) Username or alias of the target org. Not required if the `target-org` configuration variable is already set.
      --organization-id=<value>       (required) Sandbox Organization Id
      --plauti-cloud-api-key=<value>  (required) Plauti Cloud Api Key
      --verbose                       Show verbose output including job IDs and file paths

GLOBAL FLAGS
      --json               Format output as json
      --flags-dir=<value>  Import flag values from a directory.

EXAMPLES
  $ sf plauti:deduplicate:sandbox:unlink --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456
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

This plugin uses the Node.js native test runner (`node:test`), with tsx to run the TypeScript sources:

```bash
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
- **Native Testing** - Node.js `node:test` runner, tsx for TypeScript
- **ESLint** - Modern linting replacing deprecated TSLint
- **Minimal Dependencies** - Only essential dependencies for security and performance

### Commands Architecture

All commands extend `SfCommand` from `@salesforce/sf-plugins-core` and follow these patterns:

1. **Simple API Commands** - Direct REST API calls (license refresh)
2. **Async Job Commands** - Submit job + polling mechanism (config import/export)
3. **Complex Processing** - Multi-step operations with bulk data handling (CSV to job)
4. **External API Integration** - Plauti Cloud API calls (sandbox management)

### Modern CLI Standards

This plugin follows modern Salesforce CLI standards:

- **Modern Flags** - Uses `--target-org` with `-o` shorthand
- **SF CLI Only** - Built exclusively for the modern Salesforce CLI
- **Standard Architecture** - Follows `@salesforce/sf-plugins-core` patterns
- **Comprehensive Testing** - 91 tests across 19 suites validate all functionality

## Support

- [Plauti Documentation](https://www.plauti.com/hub/developer/salesforce/plauti-cli)
