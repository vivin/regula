module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-bg-shell');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            src: ['scaffold/test/regula-test.html']
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
            }
        }
    });

    grunt.registerTask('test', ['bgShell:buildTestDistribution', 'bgShell:startAsyncTestServer', 'qunit:src', 'bgShell:stopAsyncTestServer']);
};
