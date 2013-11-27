Master contains production-ready code. So I am not accepting pull requests directly into master. Instead, issue pull-requests to any of these relevant branches:

<version>-bugfix: For bugfixes related to that version. These changes will be merged down to the latest <version>-develop as well as into master when bugfixes are ready to be merged into a new release.
<version>-develop: For new features for the next release. This branch is unstable. I will mostly be using this as a staging area for new features, while the features themselves will be inside their own branches which I will eventually merge into <version>-develop. You can develop new features on your own and then submit a pull request to merge your changes into the <version>-develop branch. This branch will eventually be merged into master when the new release is ready to go out.

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
