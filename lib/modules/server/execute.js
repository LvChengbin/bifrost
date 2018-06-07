const path = require( 'path' );
const { spawn, exec } = require( 'child_process' );
const ps = require( 'ps-node' );
const sleep = require( '@lvchengbin/sleep' );

const entry = path.join( __dirname, 'app' );

async function start( options ) {
    let resolve, reject;

    const promise = new Promise( ( r1, r2 ) => {
        resolve = r1;
        reject = r2;
    } );

    const start =  spawn( 'node', [ entry, `--port=${options.port}` ], {
        detached : true
    } );
    start.unref();

    start.stderr.on( 'data', e => {
        const error = e.toString();
        if( error.toLowerCase().indexOf( 'eaddrinuse' ) ) {
            reject( `port ${options.port} is in use.` );
        }
    } );

    start.on( 'close', reject );

    sleep( 1000 ).then( resolve );
    return promise;
}

async function stop() {
    return new Promise( resolve => {
        exec( `killall node ${entry}`, {
            stdio : [ 'ignore', 'ignore', process.stderr ]
        }, () => {
            resolve();
        } );
    } );
}

async function list() {
    return new Promise( resolve => {
        ps.lookup( { 
            command : 'node',
            arguments : entry
        }, ( e, res ) => {
            if( e ) throw e;
            if( !res.length ) {
                return resolve( [] );
            }
            const list = []
            for( let p of res ) {
                let port;
                for( let arg of p.arguments ) {
                    if( /--port\s*=/.test( arg ) ) {
                        port = arg.split( '=' )[ 1 ].trim();
                    }
                }
                list.push( {
                    args : p.arguments,
                    pid : p.pid,
                    port : port
                } );
            }
            resolve( list );
        } );
    } );
}

module.exports = { start, stop, list };

