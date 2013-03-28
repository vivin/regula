echo "Building regula distribution using RequireJS Optimizer..."
java -cp src/lib/rhino/js.jar org.mozilla.javascript.tools.shell.Main src/lib/require/r.js -o build.js
echo "Optimizing further using Closure..."
java -jar src/lib/closure/compiler.jar --js dist/regula-built.js --js_output_file dist/regula-min.js
echo "Rolling over version-number..."
cat src/regula.js | perl -ne 'if($_=~/Version \d+\.\d+\.\d+/){$_=~s/(\d+\.\d+\.)(\d+)/$1 . ($2 + 1)/e;} print $_;' > src/regula.js.tmp
mv src/regula.js.tmp src/regula.js

