module.exports = function (grunt) {

    var package = grunt.file.readJSON('package.json');

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-bump');

    // Project configuration.
    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    baseUrl: "src",
                    name: "regula",
                    out: function(text, sourceMapText) {
                        text = text.replace(/{version}/, package.version);
                        grunt.file.write("dist/regula-" + package.version + ".min.js", text);
                    },
                    uglify2: {
                        output: {
                            beautify: true
                        },
                        compress: {
                            sequences: true,
                            properties: true,
                            conditionals: true,
                            evaluate: true,
                            booleans: true,
                            comparisons: true,
                            loops: true,
                            join_vars: true,
                            cascade: true
                        }
                    },
                    wrap: {
                        startFile: "src/header.frag"
                    }
                }
            },
            unoptimized: {
                 options: {
                    baseUrl: "src",
                    name: "regula",
                    out: function(text, sourceMapText) {
                        text = text.replace(/{version}/, package.version);
                        grunt.file.write("dist/regula-" + package.version + ".js", text);
                    },
                    optimize: "none",
                    wrap: {
                        startFile: "src/header.frag"
                    }
                 }
            },
            test: {
                 options: {
                    baseUrl: "src",
                    name: "regula",
                    out: "dist/regula-built-test.js",
                    optimize: "none"
                 }
            }
        },

        qunit: {
            options: {
                '--web-security': 'no',
                coverage: {
                    src: ['dist/regula-built-test.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'dist/test-reports/coverage',
                    lcovReport: 'dist/test-reports/lcov',
                    coberturaReport: 'dist/test-reports/',
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
                src: 'dist/test-reports/lcov/lcov.info'
            }
        },

        bgShell: {
            _defaults: {
                bg: true
            },

            startAsyncTestServer: {
                cmd: 'node ./src/test/async-test-server.js',
                stdout: false
            },

            stopAsyncTestServer: {
                cmd: 'curl "http://localhost:8888/?shutdown"',
                stdout: false
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                commit: false,
                push: false,
                createTag: false
            }
        }
    });

    grunt.registerTask('test', ['requirejs:test', 'bgShell:startAsyncTestServer', 'qunit_junit', 'qunit', 'bgShell:stopAsyncTestServer']);
    grunt.registerTask('build', ['requirejs:compile', 'requirejs:unoptimized']);
    grunt.registerTask('release', ['bump', 'test', 'build']);
    grunt.registerTask('travis', ['test']);
};
