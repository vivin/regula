VERSION=`grep "* Version" src/regula.js | sed -e 's,[^0-9.],,g' | tr -d '\n'`

rm -rf dist

echo "Building unoptimized regula distribution using RequireJS Optimizer..."
java -cp src/lib/rhino/js.jar org.mozilla.javascript.tools.shell.Main src/lib/require/r.js -o test-build.js
mv dist/regula-built-test.js dist/regula-$VERSION.js

echo "Building regula distribution using RequireJS Optimizer..."
java -cp src/lib/rhino/js.jar org.mozilla.javascript.tools.shell.Main src/lib/require/r.js -o build.js
mv dist/regula-built.js dist/regula-$VERSION-min.js

