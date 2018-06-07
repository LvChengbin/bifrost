const ora = require( 'ora' );
const console = require( '../../shared/console' );
const execute = require( './execute' );
const Sequence = require( '@lvchengbin/sequence' );

async function start( options, autoexit = true ) {
    if( !/^\d+$/.test( options.port ) ) {
        console.error( 'no port specified.' );
        autoexit && process.exit( 1 );
    }
    const msg = 'starting bifrost server...';
    const spinner = ora( msg ).start();
    await execute.start( options ).catch( e => {
        spinner.fail( 'failed to start bifrost server: ' + e );
        autoexit && process.exit( 1 );
    } );

    spinner.succeed( `server is started on port ${options.port}` );
    autoexit && process.exit( 0 );
}

async function stop() {
    const msg = 'stopping bifrost server...'
    const spinner = ora( msg ).start();
    await execute.stop();
    spinner.succeed( msg + 'done!' );
}

async function restart() {
    const ps = await execute.list();
    await stop();
    const steps = [];
    for( let p of ps ) {
        steps.push( () => start( { port : p.port }, false ) );
    }
    await Sequence.chain( steps );
    process.exit( 0 );
}

async function list() {
    const list = await execute.list();
    if( !list.length ) {
        console.info( 'no process found.' );
        return;
    }
    for( let p of list ) {
        console.info( `PID: ${p.pid} PORT: ${p.port}` ); 
    }
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
            case 'restart' :
                restart( options );
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
