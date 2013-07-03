./build.sh
echo "Rolling over version-number..."
cat src/regula.js | perl -ne 'if($_=~/Version \d+\.\d+\.\d+/){$_=~s/(\d+\.\d+\.)(\d+)/$1 . ($2 + 1)/e;} print $_;' > src/regula.js.tmp
mv src/regula.js.tmp src/regula.js
cat package.json | perl -ne 'if($_=~/"version": "\d+\.\d+\.\d+/){$_=~s/(\d+\.\d+\.)(\d+)/$1 . ($2 + 1)/e;} print $_;' > package.json.tmp
mv package.json.tmp package.json

