echo "Killing running tracegl processes if any..."
ps auwx | grep -i tracegl | grep -v grep | awk '{print $2;}' | perl -ne 'chomp; if($_ ne "") { `kill -9 $_`; }'

# TODO fix this script for tracegl

echo "Starting tracegl for tracing..."
node ../tracegl/tracegl.js /var/www/regula &
echo "Starting asynchronous-test server..."
node src/test/async-test-server.js 

