//tell karma which files to load.
var testContext = require.context('./test', true, /Test\.js$/);
testContext.keys().forEach(testContext);

var allContext = require.context('./src', true, /\.js$/);
allContext.keys().forEach(allContext);
