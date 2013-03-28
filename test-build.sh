echo "Building test regula distribution using RequireJS Optimizer (with optimize turned off)..."
java -cp src/lib/rhino/js.jar org.mozilla.javascript.tools.shell.Main src/lib/require/r.js -o test-build.js
