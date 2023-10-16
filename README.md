# Plauti Salesforce CLI Plugin
This is a plugin for Salesforce it's SF CLI, that extends its functionality to also be able to use it to interact with Plauti products such as Duplicate Check. 

## ⚠️ IMPORTANT: Migrating from SFDX to SF CLI
- Salesforce has recently deprecated the SFDX Command Line application in favor of the Salesforce CLI. To properly use our command line plugin, please migrate from SFDX to SF CLI, as recommended by Salesforce.
- Please find the migration instructions here: [Installation instructions SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_move_to_sf_v2.htm)
- If you are currently using SFDX (You are if any of the terminal commands you use start with `sfdx`) please make sure to remove it ([removal instructions](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_uninstall.htm))
- Plauti Salesforce CLI Plugin is compatible with the new Salesforce CLI.

## 🛠️ Prerequisites to use Plauti Salesforce CLI Plugin
- Please make sure Node 18 or higher is installed on your machine [Downloading NodeJS](https://nodejs.org/en)
- Please make sure SF CLI is installed on your machine [Installing SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
- If you have previously used SFDX (Former CLI, deprecated by Salesforce), please uninstall it [Removing SFDX]([https://nodejs.org/en](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_uninstall.htm))

## Installing Plauti Salesforce CLI Plugin
- Please make sure your machine complies with the above prequisites before you get started.
- Type the following command in your terminal `sf plugins install plauti-sfdx` and hit `Enter`.
- You'll see a prompt asking you if you want to install a plugin that is not from Salesforce, since this plugin is maintained by Plauti. Please confirm by typing `y` (for Yes) and hit `Enter`. 
- Wait for the installation to complete.

A common error during installation is `The engine "node" is incompatible with this module.` this means you are not running Node 18 or higher. If you did install Node 18, you may still have an older version on your machine that is in use. Please remove any older version of node or use a more advanced tool like [NVM](https://github.com/nvm-sh/nvm) to switch between node versions.
After making sure the correct Node version is being used, execute the installation process again. 

## Authenticating SF CLI with the desired Salesforce Org
- SF CLI needs to be linked to the Salesforce Org you want to perform any of the Plauti CLI Plugin commands on
- Extensive instructions on how to link a Salesforce Org to SF CLI are provided by Salesforce [SF CLI Login instructions](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_web_flow.htm)
```
sf org login web --alias my-org
```
Note: the alias you choose here after the `--alias` parameter, is the same you will use to tell Plauti Salesforce CLI Plugin which org it should use, so pick an alias that you can easily remember and distinguish.
Running the command above will open your browser and ask you to login to the Salesforce org you want to connect to. After logging in, check back in the terminal to see if the login went correctly.

## Plauti CLI Command Reference
After installing the SF CLI, the Plauti Salesforce CLI Plugin, and authenticating SF CLI with a Salesforce org as described above, you are able to make use of the following Plauti CLI commands. 



### Export Duplicate Check Config
Export Plauti Duplicate Check configuration

```
USAGE
  $ sf plauti duplicatecheck config export --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --file=file                                                                       (required) Export file path and name

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --pollinterval=pollinterval                                                       [default: 3] Poll interval in
                                                                                    seconds

EXAMPLES
  $ sf plauti duplicatecheck config export -u myOrg@example.com --file ./export/test_config.json
  $ sf plauti duplicatecheck config export -u myOrg@example.com --file ./export/test_config.json 
  --pollinterval 10
```

### Import Duplicate Check Config
Import Plauti Duplicate Check configuration

```
USAGE
  $ sf plauti duplicatecheck config import --file <filepath> [--pollinterval <integer>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --file=file                                                                       (required) File path

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --pollinterval=pollinterval                                                       [default: 3] Poll interval in
                                                                                    seconds

EXAMPLES
  $ sf plauti duplicatecheck config import -u myOrg@example.com --file ./export/test_config.json
  $ sf plauti duplicatecheck config import -u myOrg@example.com --file ./export/test_config.json 
  --pollinterval 10
```

### Create a Duplicate Check Job from a CSV File
Create A Plauti Duplicate Check Job based on a CSV File

```
USAGE
  $ sf plauti duplicatecheck csv tojob --file <filepath> --sourceobject <string> --matchobject <string> 
  [--setmasterformerge] [--delimiter <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --delimiter=delimiter                                                             [default: ,] Csv Delimiter

  --file=file                                                                       (required) Csv file path

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --matchobject=matchobject                                                         (required) Match Object Prefix

  --setmasterformerge                                                               Set Master record for Merge

  --sourceobject=sourceobject                                                       (required) Source Object Prefix

EXAMPLES
  $ sf plauti duplicatecheck csv tojob -u myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 
  --matchobject 001
  $ sf plauti duplicatecheck csv tojob -u myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 
  --matchobject 001 --setmasterformerge
```

### Refresh Duplicate Check License
Refresh Duplicate Check for Salesforce license

```
USAGE
  $ sf plauti duplicatecheck license refresh [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sf plauti duplicatecheck license refresh -u myOrg@example.com
```

### Link a Sandbox org to Production
Link Sandbox to Production

```
USAGE
  $ sf plauti duplicatecheck sandbox link --sandboxname <string> --plauticloudapikey <string> [--organizationid 
  <string>] [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --organizationid=organizationid                                                   Sandbox Organization Id

  --plauticloudapikey=plauticloudapikey                                             (required) Plauti Cloud Api Key

  --sandboxname=sandboxname                                                         (required) Sandbox Name

  --sandboxusername=sandboxusername                                                 Sandbox User Name

EXAMPLES
  $ sf plauti duplicatecheck sandbox link -u myOrg@example.com --organizationid 00DR0000001ossaMAA 
  --sandboxname mysandbox --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox link -u myOrg@example.com --sandboxusername scratch_org_1 
  --sandboxname mysandbox --plauticloudapikey plauti_123_123456
```

### List all Sandbox orgs linked to Production
List all sandbox orgs

```
USAGE
  $ sf plauti duplicatecheck sandbox list --plauticloudapikey <string> [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --plauticloudapikey=plauticloudapikey                                             (required) Plauti Cloud Api Key

EXAMPLE
  $ sf plauti duplicatecheck sandbox list -u myOrg@example.com --plauticloudapikey plauti_123_123456
```

### Unlink a Sandbox org from Production
Unlink Sandbox from Production

```
USAGE
  $ sf plauti duplicatecheck sandbox unlink --plauticloudapikey <string> [--organizationid <string>] 
  [--sandboxusername <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u                                                                                username or alias for the target

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --organizationid=organizationid                                                   Sandbox Organization Id

  --plauticloudapikey=plauticloudapikey                                             (required) Plauti Cloud Api Key

  --sandboxusername=sandboxusername                                                 Sandbox User Name

EXAMPLES
  $ sf plauti duplicatecheck sandbox unlink -u myOrg@example.com --organizationid 00DR0000001ossaMAA 
  --plauticloudapikey plauti_123_123456
  $ sf plauti duplicatecheck sandbox unlink -u myOrg@example.com --sandboxusername scratch_org_1 
  --plauticloudapikey plauti_123_123456
```

