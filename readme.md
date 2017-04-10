# Stater Boot
**`Micro Service Framework for NodeJS`** - A micro service manager that will help
you to create a new service by starting another services.

This framework is supposed to run any services with single command,
e.g: run the build processes and then run the server, but
these services can access any service's configs, so will be
easier to configure the services.

### Requirements
* NodeJS 6.5+ (will be 7.8+ on the next release).

***
## Installation

```bash
npm install -g @stater/boot
```

Stater Boot will have `stater-boot` and `stb` as alias on the CLI.

***
## Usage

To start using **`Stater Boot`**, you need to add
`stater-boot` property to your `package.json`.

**Example**
```json
{
  "name": "sample-service",
  "version": "1.0.0",
  "stater-boot": {
    "main": "service.js",
    "config": "configs/service-config.js"
  }
}
```

Then you need to create a service as a bootstrap service.

**Example**

**`service.js`**
```js
class SampleService {
  beforeRun = ['sb-bower-list', 'sb-build-script'];
  beforeEnd = ['sb-store-asset', 'sb-init-server', 'sb-start-server'];

  // This function will be called when the service start,
  // after starting the beforeRun services.
  // The beforeEnd services will be started after this
  // function called.
  service(context, configs) {
    let conf = configs.get('sb-server');

    context.logs.info(`Server will be running on port ${conf.port}`);
  }
}

module.exports = SampleService;
```

*The sample above is assume the services already installed,
and the created service is to run these services.*

Then you can create configs for the required services.

**Example**
**`service-config.js`**
```js
module.exports = [
  {
    // Config name is required.
    name: 'sb-server',

    // Your configs is here.
    port: 8080,

    // This function will be called after all configs registered,
    // to allow you reconfigure your config that depends
    // on something else.
    reconfigure(config) {
      if (process.argv.includes('--prod')) {
        config.port = 80;
      }
    }
  },
  {
    name: 'sb-bower-list',
    cwd: 'bower_components'
  }
];
```

To start the service, run this command:

```bash
stater-boot
```
or
```bash
stb
```

To start specific services, include the service(s) name
after the command. Example:

```bash
stater-boot foo bar
```
or
```bash
stb foo bar
```

**Example using command and options**:

```bash
stb foo bar -d src -c configs/stb-configs.js --debug --erroff
```

From the sample above, it run services `foo` and `bar`,
set the workding directory (`-d`) to `src` folder,
and set the config file (`-c`) to `configs/stb-configs.js`,
with debug logging (`--debug`), and keep the services running
even when some error happen (`--erroff`).


For more usage info, run this command:

```bash
stb help
```

---

> Detailed docs will come soon. Please check the **`test`** folder for example.

***
## Changelog

### **`v1.0.4`** - Apr 11, 2017

* Removing dist folder from repo.
* Adding SourceMap support.
* Adding support to start specific services from CLI.
* Adding binary shorthand `stb` as `stater-boot`.
* Improvements.

### **`v1.0.3`** - Apr 5, 2017

* Updating readme.
* Adding working directory handler (`-d`).

### **`v1.0.2`** - Apr 5, 2017

* Fixing Service Loader.
* Improve error handling.
* Updating CLI Helper.
* Adding Test.
* Fixing CLI Help Info.

### **`v1.0.1`** - Apr 5, 2017

* Chnage the `read-cli` dependency to `@stater/read-cli`.

### **`v1.0.0`** - Apr 5, 2017

* Initial release.

***
## The MIT License **`(MIT)`**

Copyright © 2017 Nanang Mahdaen El Agung

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
