echo "Killing running async-test-server processes if any..."
ps auwx | grep -i async-test-server | grep -v grep | awk '{print $2;}' | perl -ne 'chomp; if($_ ne "") { `kill -9 $_`; }'

./test-build.sh
echo "Starting asynchronous-test server..."
node src/test/async-test-server.js 

