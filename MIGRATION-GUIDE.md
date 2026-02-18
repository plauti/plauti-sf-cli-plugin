# Migration Guide: Plauti Duplicate Check → Plauti Deduplicate

This guide helps you migrate from the old `plauti-sfdx` package (with `plauti:duplicatecheck:*` commands) to the new `plauti-sf-cli-plugin` package (with `plauti:deduplicate:*` commands).

## Quick Command Reference

| Old Command | New Command |
|-------------|-------------|
| `sf plauti:duplicatecheck:license:refresh` | `sf plauti:deduplicate:license:refresh` |
| `sf plauti:duplicatecheck:config:export` | `sf plauti:deduplicate:config:export` |
| `sf plauti:duplicatecheck:config:import` | `sf plauti:deduplicate:config:import` |
| `sf plauti:duplicatecheck:csv:tojob` | `sf plauti:deduplicate:csv:tojob` |
| `sf plauti:duplicatecheck:sandbox:link` | `sf plauti:deduplicate:sandbox:link` |
| `sf plauti:duplicatecheck:sandbox:list` | `sf plauti:deduplicate:sandbox:list` |
| `sf plauti:duplicatecheck:sandbox:unlink` | `sf plauti:deduplicate:sandbox:unlink` |

## Package Name Changes

### Old Package
```bash
sf plugins install plauti-sfdx
```

### New Package  
```bash
sf plugins install plauti-sf-cli-plugin
```

**Important:** If you have the old `plauti-sfdx` package installed, you should uninstall it first:
```bash
sf plugins uninstall plauti-sfdx
```

## Installation Changes

### Complete Migration Steps
```bash
# 1. Uninstall old package
sf plugins uninstall plauti-sfdx

# 2. Install new package
sf plugins install plauti-sf-cli-plugin
```

## Command Flag Changes

### Target Org Flag
The target org flag has been updated to use the new Salesforce CLI v2 standard:

**Old Format:**
```bash
-u, --targetusername <username>
```

**New Format:**
```bash
-o, --target-org <org>
```

### Example Migration

**Old Command:**
```bash
sf plauti:duplicatecheck:license:refresh -u myorg@example.com
```

**New Command:**
```bash
sf plauti:deduplicate:license:refresh --target-org myorg@example.com
```

## Command-Specific Changes

### License Refresh
- **Old:** `sf plauti:duplicatecheck:license:refresh`
- **New:** `sf plauti:deduplicate:license:refresh`
- **Changes:** Command name only, functionality identical

### Config Export
- **Old:** `sf plauti:duplicatecheck:config:export`
- **New:** `sf plauti:deduplicate:config:export`  
- **Changes:** Command name and target org flag format

### Config Import
- **Old:** `sf plauti:duplicatecheck:config:import`
- **New:** `sf plauti:deduplicate:config:import`
- **Changes:** Command name and target org flag format

### CSV to Job
- **Old:** `sf plauti:duplicatecheck:csv:tojob`
- **New:** `sf plauti:deduplicate:csv:tojob`
- **Changes:** Command name and target org flag format

### Sandbox Management
- **Link:** `sf plauti:duplicatecheck:sandbox:link` → `sf plauti:deduplicate:sandbox:link`
- **List:** `sf plauti:duplicatecheck:sandbox:list` → `sf plauti:deduplicate:sandbox:list`  
- **Unlink:** `sf plauti:duplicatecheck:sandbox:unlink` → `sf plauti:deduplicate:sandbox:unlink`
- **Changes:** Command names and target org flag format

## Breaking Changes

### 1. Command Namespace
All commands now use `plauti:deduplicate:*` instead of `plauti:duplicatecheck:*`

### 2. Target Org Flag
- Old: `-u, --targetusername`
- New: `-o, --target-org`

### 3. Salesforce CLI Version
- Requires Salesforce CLI v2.x
- Built with modern SF CLI framework for better performance and reliability

## Functional Compatibility

All commands maintain **100% functional compatibility** with their previous versions:
- Same API endpoints
- Same business logic  
- Same error handling
- Same output formats
- Same flag options (except target org format)

## Migration Script Example

Here's a simple bash script to help migrate your existing scripts:

```bash
#!/bin/bash

# Example migration script
# Replace old commands with new ones

# Old script:
# sf plauti:duplicatecheck:license:refresh -u myorg@example.com

# New script:
sf plauti:deduplicate:license:refresh --target-org myorg@example.com

# Old script:
# sf plauti:duplicatecheck:config:export -u myorg@example.com --file ./config.json

# New script:  
sf plauti:deduplicate:config:export --target-org myorg@example.com --file ./config.json
```

## Validation Steps

After migration, validate your setup:

1. **Test Command Availability:**
   ```bash
   sf plauti:deduplicate --help
   ```

2. **Test License Refresh:**
   ```bash
   sf plauti:deduplicate:license:refresh --target-org your-org
   ```

3. **Test Config Export:**
   ```bash
   sf plauti:deduplicate:config:export --target-org your-org --file test-export.json
   ```

## Troubleshooting

### Common Issues

**Issue:** Command not found
```
Error: command plauti:deduplicate:license:refresh not found
```
**Solution:** Ensure you have the latest plugin version installed

**Issue:** Invalid target org format  
```
Error: No org configuration found for name undefined
```
**Solution:** Use `--target-org` instead of `-u` or `--targetusername`

## Support

If you encounter issues during migration:

1. Check that you're using Salesforce CLI v2.x
2. Ensure the plugin is updated to the latest version  
3. Verify your org authentication is working
4. Contact Plauti support for additional assistance

## Timeline

- **Old Commands:** Deprecated but still functional in older plugin versions
- **New Commands:** Available now in latest plugin version  
- **Recommended Action:** Migrate scripts and documentation at your convenience