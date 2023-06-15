plauti-sfdx
===========

Plauti SFDX Plugin

[![Version](https://img.shields.io/npm/v/plauti-sfdx.svg)](https://npmjs.org/package/plauti-sfdx)
[![CircleCI](https://circleci.com/gh/plauti/plauti-sfdx/tree/master.svg?style=shield)](https://circleci.com/gh/plauti/plauti-sfdx/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/plauti/plauti-sfdx?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/plauti-sfdx/branch/master)
[![Codecov](https://codecov.io/gh/plauti/plauti-sfdx/branch/master/graph/badge.svg)](https://codecov.io/gh/plauti/plauti-sfdx)
[![Greenkeeper](https://badges.greenkeeper.io/plauti/plauti-sfdx.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/plauti/plauti-sfdx/badge.svg)](https://snyk.io/test/github/plauti/plauti-sfdx)
[![Downloads/week](https://img.shields.io/npm/dw/plauti-sfdx.svg)](https://npmjs.org/package/plauti-sfdx)
[![License](https://img.shields.io/npm/l/plauti-sfdx.svg)](https://github.com/plauti/plauti-sfdx/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g plauti-sfdx
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
plauti-sfdx/0.0.1 darwin-x64 node-v10.15.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx plauti:duplicatecheck:config:export --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatecheckconfigexport---file-filepath---pollinterval-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:config:import --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatecheckconfigimport---file-filepath---pollinterval-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:license:refresh [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatechecklicenserefresh--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:sandbox:link --sandboxname <string> [--organizationid <string>] [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatechecksandboxlink---sandboxname-string---organizationid-string---sandboxusername-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:sandbox:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatechecksandboxlist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:sandbox:unlink [--organizationid <string>] [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-plautiduplicatechecksandboxunlink---organizationid-string---sandboxusername-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge`](#sfdx-plautiduplicatecheckcsvtojob---targetusername-myorgexamplecom---file-myfirstjobcsv---sourceobject-001---matchobject-001---setmasterformerge)

## `sfdx plauti:duplicatecheck:config:export --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Export Plauti Duplicate Check configuration

```
USAGE
  $ sfdx plauti:duplicatecheck:config:export --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --file=file                                                                       (required) Export file path and name

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --pollinterval=pollinterval                                                       [default: 3] Poll interval in
                                                                                    seconds

EXAMPLES
  $ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com --file ./export/test_config.json
  $ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com --file ./export/test_config.json 
  --pollinterval 10
```

_See code: [lib/commands/plauti/duplicatecheck/config/export.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/config/export.js)_

## `sfdx plauti:duplicatecheck:config:import --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Import Plauti Duplicate Check configuration

```
USAGE
  $ sfdx plauti:duplicatecheck:config:import --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --file=file                                                                       (required) File path

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --pollinterval=pollinterval                                                       [default: 3] Poll interval in
                                                                                    seconds

EXAMPLES
  $ sfdx plauti:duplicatecheck:config:import --targetusername myOrg@example.com --file ./export/test_config.json
  $ sfdx plauti:duplicatecheck:config:import --targetusername myOrg@example.com --file ./export/test_config.json 
  --pollinterval 10
```

_See code: [lib/commands/plauti/duplicatecheck/config/import.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/config/import.js)_

## `sfdx plauti:duplicatecheck:license:refresh [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Refresh Duplicate Check for Salesforce license

```
USAGE
  $ sfdx plauti:duplicatecheck:license:refresh [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx plauti:duplicatecheck:license:refresh --targetusername myOrg@example.com
```

_See code: [lib/commands/plauti/duplicatecheck/license/refresh.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/license/refresh.js)_

## `sfdx plauti:duplicatecheck:sandbox:link --sandboxname <string> [--organizationid <string>] [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Link Sandbox to Production

```
USAGE
  $ sfdx plauti:duplicatecheck:sandbox:link --sandboxname <string> [--organizationid <string>] [--sandboxusername 
  <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --organizationid=organizationid                                                   Sandbox Organization Id

  --sandboxname=sandboxname                                                         (required) Sandbox Name

  --sandboxusername=sandboxusername                                                 Sandbox User Name

EXAMPLES
  $ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA 
  --sandboxname mysandbox
  $ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --sandboxusername scratch_org_1 
  --sandboxname mysandbox
```

_See code: [lib/commands/plauti/duplicatecheck/sandbox/link.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/sandbox/link.js)_

## `sfdx plauti:duplicatecheck:sandbox:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

List all sandbox orgs

```
USAGE
  $ sfdx plauti:duplicatecheck:sandbox:list [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com
```

_See code: [lib/commands/plauti/duplicatecheck/sandbox/list.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/sandbox/list.js)_

## `sfdx plauti:duplicatecheck:sandbox:unlink [--organizationid <string>] [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Unlink Sandbox from Production

```
USAGE
  $ sfdx plauti:duplicatecheck:sandbox:unlink [--organizationid <string>] [--sandboxusername <string>] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --organizationid=organizationid                                                   Sandbox Organization Id

  --sandboxusername=sandboxusername                                                 Sandbox User Name

EXAMPLES
  $ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA
  $ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --sandboxusername scratch_org_1
```

_See code: [lib/commands/plauti/duplicatecheck/sandbox/unlink.js](https://github.com/plauti/plauti-sfdx/blob/v0.0.1/lib/commands/plauti/duplicatecheck/sandbox/unlink.js)_

## `sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge`

Create a Duplicate Check Job from a csv file of known duplicates.
The desired file structure is;

```
Master,ToMerge
00QAW000005yzc42AA,00QAW000005yziN2AQ
00QAW000005yzc42AA,00QAW000005z2Wv2AI
00QAW000005z5pV2AQ,00QAW000005z4752AA
```

```
USAGE
  $ sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --file=./myFirstJob.csv                                                           The path to the file that contains
                                                                                    known duplicates, in the format
                                                                                    specified above.

  --sourceobject=001                                                                SF Prefix of the source object
  
  --matchobject=001                                                                 SF Prefix of the match object
  
  --setmasterformerge                                                               Optional flag to sets the master 
                                                                                    record to be the master in the 
                                                                                    merge, no values are taken from the 
                                                                                    ToMerge records. Only the related 
                                                                                    records are reparented. If value is
                                                                                    false, DC merge rules are applied.

EXAMPLES
  $ sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge
  $ sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001
```

<!-- commandsstop -->
