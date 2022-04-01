# hybris-hac-api

## Access to HAC Console API

### Execute flexible search

```javascript
const hac = require('hybris-hac-api');

hac
  .flexibleSearch(
    'select {pk} from {product} where {code} = "abc-def-ghi"'
  )
  .then((result) => console.log(result));
```

### Execute impex import

```javascript
const hac = require('hybris-hac-api');

hac.impexImport('UPDATE Product; code[unique=true]; name\n ; abc-def-ghi ; My Product');
```

### Execute scripts

By default script execution is done with commit flag set to `true` and script type as `groovy`:

```javascript
const hac = require('hybris-hac-api');

hac.executeScript('println "hello"').then((result) => console.log(result));
```

Settings commit flag and script type can be overridden:

```javascript
const hac = require('hybris-hac-api');

hac.executeScript('println "hello"', false, 'shell').then((result) => console.log(result));
```

## Configuration

The following environment variables must be set before you can successfully run console imports:

- `HAC_HOST`
- `HAC_USER`
- `HAC_PASSWORD`
- `HYBRIS_VERSION`

This is done in project specific `.env` file:

```shell
HAC_HOST=http://my-hybris-server.tst:9001
HAC_USER=admin
HAC_PASSWORD=nimda
HYBRIS_VERSION=5.7
```

You can also set it globally on your machine:

```shell
export HAC_HOST=http://my-hybris-server.tst:9001
export HAC_USER=admin
export HAC_PASSWORD=nimda
export HYBRIS_VERSION=5.7
```
