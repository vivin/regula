module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            options: {
                '--web-security': 'no',
                coverage: {
                    src: ['dist/regula-built-test.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'report/coverage',
                    lcovReport: 'report/lcov',
                    coberturaReport: 'report/',
                    linesThresholdPct: 85
                }
            },
            all: ['scaffold/test/regula-test.html']
        },

        qunit_junit: {
            options: {
                dest: 'dist/test-reports'
            }
        },

        coveralls: {
            options: {
                force: false
            },
            main_target: {
                src: 'report/lcov/lcov.info'
            }
        },

        bgShell: {
            _defaults: {
                bg: true
            },

            buildTestDistribution: {
                cmd: './test-build.sh',
                bg: false
            },

            startAsyncTestServer: {
                cmd: 'node ./src/test/async-test-server.js',
                stdout: false
            },

            stopAsyncTestServer: {
                cmd: 'curl "http://localhost:8888/?shutdown"',
                stdout: false
            },

            buildRelease: {
                cmd: './build-release.sh',
                bg: false
            },

            build: {
                cmd: './build.sh',
                bg: false
            },
        }
    });

    grunt.registerTask('test', ['bgShell:buildTestDistribution', 'bgShell:startAsyncTestServer', 'qunit_junit', 'qunit', 'bgShell:stopAsyncTestServer']);
    grunt.registerTask('build', ['bgShell:build']);
    grunt.registerTask('release', ['bgShell:buildRelease']);
    grunt.registerTask('travis', ['test']);
};
