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

    const args = [ entry, `--port=${options.port}` ];

    if( options.config ) {
        args.push( `--config=${options.config}` );
    }

    const start =  spawn( 'node', args, {
        detached : true
    } );
    start.unref();

    start.stderr.on( 'data', e => {
        const error = e.toString();
        if( error.toLowerCase().indexOf( 'eaddrinuse' ) > -1 ) {
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
                const item = {
                    args : p.arguments,
                    pid : p.pid
                };
                for( let arg of p.arguments ) {
                    if( !arg.indexOf( '--port=' ) ) {
                        item.port = arg.split( '=' )[ 1 ];
                        continue;
                    }

                    if( !arg.indexOf( '--config=' ) ) {
                        item.config = arg.split( '=' )[ 1 ];
                        continue;
                    }

                    if( !arg.indexOf( '--port-overwritten=' ) ) {
                        item[ 'port-overwritten' ] = arg.split( '=' )[ 1 ];
                        continue;
                    }

                }
                list.push( item );
            }
            resolve( list );
        } );
    } );
}

module.exports = { start, stop, list };

