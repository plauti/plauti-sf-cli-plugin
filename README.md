# Plauti Duplicate Check CLI Plugin for Salesforce

A Salesforce CLI plugin that provides commands for interacting with Plauti Duplicate Check.

[![Version](https://img.shields.io/npm/v/plauti-sfdx.svg)](https://npmjs.org/package/plauti-sfdx)
[![License](https://img.shields.io/npm/l/plauti-sfdx.svg)](https://github.com/plauti/plauti-sf-cli-plugin/blob/main/package.json)

## Requirements

- Node.js 24.0.0 or higher
- Salesforce CLI v2

## Installation

Install as a Salesforce CLI plugin:

```bash
sf plugins install plauti-sfdx
```

Or install from source:

```bash
git clone https://github.com/plauti/plauti-sf-cli-plugin.git
cd plauti-sf-cli-plugin
npm install
sf plugins link .
```

## Commands

### License Management

#### `sf plauti duplicatecheck license refresh`

Refresh your Plauti Duplicate Check for Salesforce license.

```bash
sf plauti duplicatecheck license refresh --target-org myOrg@example.com
```

**Options:**
- `--target-org` (required) - Target Salesforce org

### Configuration Management  

#### `sf plauti duplicatecheck config export`

Export Plauti Duplicate Check configuration to a file.

```bash
sf plauti duplicatecheck config export --target-org myOrg@example.com --file ./config.json
```

**Options:**
- `--target-org` (required) - Target Salesforce org
- `--file` (required) - Output file path
- `--poll-interval` - Poll interval in seconds (default: 3)

#### `sf plauti duplicatecheck config import`

Import Plauti Duplicate Check configuration from a file.

```bash
sf plauti duplicatecheck config import --target-org myOrg@example.com --file ./config.json
```

**Options:**
- `--target-org` (required) - Target Salesforce org  
- `--file` (required) - Input configuration file path
- `--poll-interval` - Poll interval in seconds (default: 3)

### Data Processing

#### `sf plauti duplicatecheck csv tojob`

Create a Plauti Duplicate Check job from a CSV file containing potential duplicates.

```bash
sf plauti duplicatecheck csv tojob --target-org myOrg@example.com --file ./duplicates.csv --source-object 001 --match-object 001
```

**Options:**
- `--target-org` (required) - Target Salesforce org
- `--file` (required) - CSV file path
- `--source-object` (required) - Source object prefix (e.g., 001 for Account)
- `--match-object` (required) - Match object prefix (e.g., 001 for Account)
- `--set-master-for-merge` - Set master record for merge operations
- `--delimiter` - CSV delimiter (default: ',')

**CSV Format:**
```csv
master,duplicate
0011234567890123,0011234567890456
0011234567890123,0011234567890789
```

### Sandbox Management

#### `sf plauti duplicatecheck sandbox link`

Link a sandbox organization to production for license sharing.

```bash
sf plauti duplicatecheck sandbox link --target-org myOrg@example.com --organization-id 00D123456789012 --sandbox-name "My Sandbox" --plauti-cloud-api-key your-api-key
```

**Options:**
- `--target-org` (required) - Target production org
- `--organization-id` - Sandbox organization ID (use this OR --sandbox-username)  
- `--sandbox-username` - Sandbox username (use this OR --organization-id)
- `--sandbox-name` (required) - Display name for the sandbox
- `--plauti-cloud-api-key` (required) - Plauti Cloud API key

#### `sf plauti duplicatecheck sandbox list`

List all linked sandbox organizations.

```bash
sf plauti duplicatecheck sandbox list --target-org myOrg@example.com --plauti-cloud-api-key your-api-key
```

**Options:**
- `--target-org` (required) - Target production org
- `--plauti-cloud-api-key` (required) - Plauti Cloud API key

#### `sf plauti duplicatecheck sandbox unlink`

Unlink a sandbox from the production organization.

```bash
sf plauti duplicatecheck sandbox unlink --target-org myOrg@example.com --organization-id 00D123456789012 --plauti-cloud-api-key your-api-key
```

**Options:**
- `--target-org` (required) - Target production org
- `--organization-id` - Sandbox organization ID (use this OR --sandbox-username)
- `--sandbox-username` - Sandbox username (use this OR --organization-id)  
- `--plauti-cloud-api-key` (required) - Plauti Cloud API key

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

## Support

- [Plauti Documentation](https://www.plauti.com/support/en_US/duplicate-check/)
- [GitHub Issues](https://github.com/plauti/plauti-sf-cli-plugin/issues)

## License

MIT License. See [LICENSE](LICENSE) for details.