notes/ contains the ebnf for constraint annotations.
scaffold/ contains HTML for qunit test pages and for sandbox HTML pages where I can play around and debug stuff using tracegl
src/ contains the source code for the project along with third-party libraries

Grunt:

grunt test - Runs the entire test suite. Please run this before committing.
grunt build - Builds a complete, optimized distribution of the project.
grunt release - Builds a complete, optimized distribution of thr project for release.

Shell Scripts:

build.sh will build a complete, optimized distribution of the project.
build-release.sh will build a complete, optimized distribution of the project for release.
test-build.sh will build a complete distribution that has NOT been optimized, which makes debugging easier during tests.
start-test-env.sh will start up a running test-environment. 
trace-coverage-start-test-env.sh starts up a running test-environment with tracing (tracegl) and coverage (JSCoverage) enabled.
