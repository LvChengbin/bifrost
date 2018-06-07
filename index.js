'use strict';

const yargs = require( 'yargs' );
const Liftoff = require( 'liftoff' );
const v8flags = require( 'v8flags' );
const console = require( './lib/shared/console' );
const modules = require( './lib/modules' );
const init = require( './lib/init' );

/**
 * to get the cli options.
 */
const options = yargs.argv;

const cli = new Liftoff( {
    name : 'bifrost',
    processTitle : 'bifrost',
    moduleName : 'bifrost',
    configFiles : {
        '.bifrost' : {
            home : {
                path : '~',
                extensions : {
                    '.js' : null,
                    '.json' : null
                },
            },
            cwd : {
                path : '.',
                extensions : {
                    '.js' : null,
                    '.json' : null
                }
            }
        }
    },
    v8flags
} );

cli.on( 'require', name => {
    console.log( `requiring external module: ${name}.` );
} );

cli.on( 'requireFail', name => {
    console.warn( `failed to load external module: ${name}.` );
} );

cli.on( 'respawn', ( flags, child ) => {
    console.info( `node flags detected: [ ${flags.join( ', ' )} ].` );
    console.info( `respawned to PID: ${child.pid}.` );
} );

module.exports = () => {
    cli.launch( {
        cwd : options.cwd,
        configPath : options.config
    }, env => {
        init();
        // bifrost send file.txt s95:~/ 
        // bifrost get s95:~/file.txt ~/path
        //console.debug( 'env', env );
        modules( options );
    } );
};
