echo "Killing running JSCover processes if any..."
ps auwx | grep -i jscover.jar | grep -v grep | awk '{print $2;}' | perl -ne 'chomp; if($_ ne "") { `kill -9 $_`; }'

echo "Killing running tracegl processes if any..."
ps auwx | grep -i tracegl | grep -v grep | awk '{print $2;}' | perl -ne 'chomp; if($_ ne "") { `kill -9 $_`; }'

echo "Killing running async-test-server processes if any..."
ps auwx | grep -i async-test-server | grep -v grep | awk '{print $2;}' | perl -ne 'chomp; if($_ ne "") { `kill -9 $_`; }'

./test-build.sh

echo "Starting JSCover for coverage metrics... Navigate to http://localhost:8080/jscoverage.html?/index.html for metrics. Enter http://localhost:8080/scaffold/test/regula-test.html as URL."
java -jar src/lib/jscover/JSCover.jar -ws --document-root=/var/www/regula --report-dir=target &
echo "Starting tracegl for tracing..."
node ../tracegl/tracegl.js /var/www/regula &
echo "Starting asynchronous-test server..."
node src/test/async-test-server.js 

