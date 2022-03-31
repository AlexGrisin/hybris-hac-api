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

```javascript
const hac = require('hybris-hac-api');

hac.executeScript('println "hello"').then((result) => console.log(result));
```

## Configuration

The following environment variables must be set before you can successfully run console imports:

- `HAC_HOST`
- `HAC_USER`
- `HAC_PASSWORD`

This is done in project specific `.env` file. You can set it globally on your machine:

```shell
export HAC_HOST=http://my-hybris-server.tst:9001
export HAC_USER=admin
export HAC_PASSWORD=nimda
```
