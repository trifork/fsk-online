'use strict';

const grunt = require('grunt');

module.exports = base.grunt.library({
    project: grunt.file.readJSON('package.json'),
    clean: [ 'target/lib' ]
});
