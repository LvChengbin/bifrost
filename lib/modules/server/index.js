const path = require( 'path' );
const { spawn, exec } = require( 'child_process' );
const ora = require( 'ora' );
const sleep = require( '@lvchengbin/sleep' );
const ps = require( 'ps-node' );
const console = require( '../../shared/console' );

const entry = path.join( __dirname, 'app' );

async function start( options ) {
    let failed = false;

    if( !/^\d+$/.test( options.port ) ) {
        console.error( 'no port specified.' );
        process.exit( 1 );
    }
    const msg = 'starting bifrost server...';
    const spinner = ora( msg ).start();
    const start =  spawn( 'node', [ entry, `--port=${options.port}` ], {
        detached : true
    } );

    let emsg = '';

    start.unref();

    start.stderr.on( 'data', e => {
        const error = e.toString();
        if( error.toLowerCase().indexOf( 'eaddrinuse' ) ) {
            emsg = `port ${options.port} is in use.`;
            return;
        }
    } );

    start.on( 'close', () => {
        failed = true;
        spinner.fail( 'failed to start bifrost server: ' + emsg );
    } );

    await sleep( 1000 );

    if( !failed ) {
        spinner.succeed( `server is started on port ${options.port}` );
    }
    process.exit( 0 );
}

async function stop() {
    const msg = 'stopping bifrost server...'

    const spinner = ora( msg ).start();
    exec( `killall node ${entry}`, {
        stdio : [ 'ignore', 'ignore', process.stderr ]
    }, () => {
        spinner.succeed( msg + 'done!' );
    } );
}

async function list() {
     
    ps.lookup( {
        command : 'node'
    }, ( e, res ) => {
        if( e ) {
            console.error( e );
            process.exit( 1 );
        }

        if( !res.length ) {
            console.info( 'no process found.' );
        }

        for( let p of res ) {
            let port;
            for( let arg of p.arguments ) {
                if( /--port\s*=/.test( arg ) ) {
                    port = arg.split( '=' )[ 1 ].trim();
                }
            }
            console.info( `PID: ${p.pid} PORT: ${port}` ); 
        }
    } );

}

module.exports = {
    cmd : [ 'server' ],
    run( options ) {
        const args = options._;
        const cmd = args[ 1 ];

        switch( cmd ) {
            case 'start' :
                start( options );
                break;
            case 'stop' :
                stop( options );
                break;
            case 'list' :
                list( options );
                break;
            default :
                console.error( `unknown command ${cmd}.` );
                break;
        }
    }
};
