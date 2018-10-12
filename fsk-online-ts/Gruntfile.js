'use strict';

const grunt = require('grunt');
const base = require('fmko-typescript-build');

module.exports = base.grunt.module({
  project: grunt.file.readJSON('package.json'),
  webpack: {
    "fmkoddv": require('./webpack.config.js')
  },
  copy: {
    js: {
      files: [
        {
          expand: true,
          cwd: 'node_modules/pikaday',
          src: 'pikaday.js',
          dest: 'target/js'
        },
        {
          expand: true,
          cwd: 'node_modules/moment',
          src: 'moment.js',
          dest: 'target/js'
        },
        {
          expand: true,
          cwd: 'node_modules/fmko-typescript-common/target/lib',
          src: 'index.js',
          dest: 'target/js'
        }
      ]
    },
    css: {
      files: [
        {
          expand: true,
          cwd: 'node_modules/pikaday/css',
          src: '*.css',
          dest: 'target/css'
        },
        {
          expand: true,
          cwd: 'src/main/webapp/css',
          src: '*.css',
          dest: 'target/css'
        }
      ]
    }
  },
  clean: [ 'target/js' ]
});
