# Remote and Chill Firefox Extension

Watch movies together remotely on Firefox!

## Building

`yarn install` and then change the import of `./node_modules/apollo-link-state/lib/index.js` according to the diff below. Then `yarn build` can be run.


```diff
import { ApolloLink, Observable, } from 'apollo-link';
import { hasDirectives, getMainDefinition } from 'apollo-utilities';
-import { graphql } from 'graphql-anywhere/lib/async';
+import async from 'graphql-anywhere/lib/async';
+const { graphql } = async;
import { removeClientSetsFromDocument } from './utils';
```

Credit goes to: https://github.com/apollographql/apollo-client/issues/3276
