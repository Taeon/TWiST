module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            options: {
                yuicompress: true
            },
            development: {
                files: {
                    "www/assets/css/style.css": "src/less/main.less"
                }
            }
        },
        copy: {
          main: {
            files:[
                {
                    src: 'local_components/css/*.css',
                    dest: 'www/assets/css/',
                    flatten: true,
                    expand: true,
                },
                //{
                //    src: 'bower_components/react/react.min.js',
                //    dest: 'www/assets/js/',
                //    flatten: true,
                //    expand: true,
                //},
            ]
          },
        },
        concat: {
            js: {
                options: {
                    separator: ';'
                },
                src: [
                    'local_components/js/*.js',
                    'www/assets/js/common.js'
                ],
                dest: 'www/assets/js/common.js'
            },
            css: {
                options: {
                    separator: ''
                },
                src: [
                    'bower_components/react-widgets/dist/css/react-widgets.css',
                    'www/assets/css/style.css'
                ],
                dest: 'www/assets/css/style.css'
            }
        },
        browserify: {
          options: {
            browserifyOptions: {
                extensions: '.jsx'
            },
            transform: [ require('grunt-react').browserify ]
          },
          client: {
            src: ['src/jsx/**/*.*',],
            dest: 'www/assets/js/common.js'
          }
        },
        watch: {
            js:{
                files: [
                    'src/**/*.jsx',
                    'bower_components/teamwork-api/src/teamwork-api.js',
                    '<%= concat.js.src %>'
                ],
                tasks: ['browserify','concat:js'/*,'uglify'*/]
            },
            css:{
                files: [
                    'src/less/*.less',
                    '<%= concat.css.src %>',
                    'local_components/css/**/*.css',
                ],
                tasks: ['less','concat:css','cssmin','copy']
            },
            options: {
                spawn: false,
            }
        },
        uglify: {
            js: {
                files:{
                    'www/assets/js/common.js': 'www/assets/js/common.js'
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            css: {
                expand: true,
                cwd: 'www/assets/css/',
                src: ['*.css'],
                dest: 'www/assets/css/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-browserify');
    
    grunt.registerTask(
        'default',
        [
//            'watch',
            'less',
            'concat:css',
            'copy',
            'browserify',
            'concat:js',
            /*'uglify'*/,
            'cssmin',
        ]
    );

};
