echo "Building regula distribution using RequireJS Optimizer..."
java -cp src/lib/rhino/js.jar org.mozilla.javascript.tools.shell.Main src/lib/require/r.js -o build.js
echo "Optimizing further using Closure..."
java -jar src/lib/closure/compiler.jar --js dist/regula-built.js --js_output_file dist/regula-min.js

