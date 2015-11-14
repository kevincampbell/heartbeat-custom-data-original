
module.exports = function (grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js: {
                src: ["src/js/**/*.js", "!src/js/Main.js", "src/js/Main.js"],
                dest: "www/js/<%= pkg.name %>.js"
            }
        },
        clean: {
            all: ["www", "release"]
        },

        mustache_render: {
            options: {},
            default: {
                files: [
                    {
                        data: {
                            package: grunt.file.readJSON("package.json"),
                            date: new Date()
                        },
                        template: "src/mustache/index.mustache",
                        dest: "www/index.html"
                    },
                    {
                        data: {//player.theplatform.com/p/yHjoOC/BdGYP_N32ljp/select/media/guid/2392245812/ba960fb870b05be81459fdd2581ddf7a?autoPlay=true
                            version: "<%= pkg.version %> " + new Date(),
                            playerUrl: "http://player.theplatform.com/p/yHjoOC/BdGYP_N32ljp/select/media/guid/2392245812/ba960fb870b05be81459fdd2581ddf7a?autoPlay=true"
                        },
                        template: "src/mustache/test-harness.mustache",
                        dest: "www/player.html"
                    }

                ]

            }
        },

        copy: {
            js: {
                files: [
                    {
                        src: "src/js/<%= pkg.name %>.js",
                        dest: "www/js/<%= pkg.name %>.js"
                    }
                ]
            }
        },
        'ftp-deploy': {
            main: {
                auth: {
                    host: 'theplatcal.com',
                    port: 21,
                    authKey: 'theplatcal'
                },
                src: 'www/',
                dest: '<%= pkg.domain %>/',
                exclusions: []
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.mustache', 'src/**/*.js', 'src/**/*.jsx', 'src/**/*.css', 'Gruntfile.js', 'src/**/*.json', 'package.json'],
                tasks: ['default'],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 80,
                    hostname: 'localhost',
                    base: 'www'
                }
            }
        },

        compress: {
            release: {
                options: {
                    archive: 'release/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {src: ['www/**'], dest: '/'} // includes files in path and its subdirs
                ]
            }
        },
        uglify: {
            options: {
                banner: "/* <%= pkg.name %> <%= pkg.version %>.<%= new Date().getTime() %> */"
            },
            default: {
                files: {
                    'www/js/<%= pkg.name %>.min.js': ['www/js/<%= pkg.name %>.js']
                }
            }
        },
        exec: {
            npmpack: {
                command: 'npm pack'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks("grunt-mustache-render");
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['clean:all', 'mustache_render', 'concat', 'copy', 'uglify', 'compress']);
    grunt.registerTask('dev', ['default', 'connect', 'watch']);
    grunt.registerTask('deploy', ['default', 'ftp-deploy']);

};