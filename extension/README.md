# Remote and Chill Web Extension

Remote and Chill currently supports Google Chrome and Firefox web extensions. The process for building both of the extensions is currently the same. No packaging has been implemented yet, so you need to load the unpacked extension. Simply run `npm install` or `yarn` to install the dependencies. Then run `webpack-cli` to start watching for file changes and generate the necessary files. The output directory will be `dist` which can be directly loaded in Google Chrome or Firefox.
