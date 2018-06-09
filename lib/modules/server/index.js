const ora = require( 'ora' );
const console = require( '../../shared/console' );
const execute = require( './execute' );
const Sequence = require( '@lvchengbin/sequence' );

async function start( options, autoexit = true ) {
    const ps = await execute.list();
    if( ps.length ) {
        console.error( 'bifrost server is running.' );
        autoexit && process.exit(1 )
    }
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

async function restart( options, config ) {
    const ps = await execute.list();
    if( !ps.length ) {
        console.warn( 'bifrost server is not running.' );
        process.exit( 1 );
    }
    await stop();
    const steps = [];
    for( let p of ps ) {
        const overwritten = ( p.overwritten == 1 );
        let port = p.port;
        if( !overwritten ) {
            port = config.get( 'server.port' );
        }
        steps.push( () => start( { 
            port,
            config : p.config,
            'port-overwritten' : overwritten
        }, false ) );
    }
    await Sequence.chain( steps );
    process.exit( 0 );
}

async function status() {
    const list = await execute.list();
    if( !list.length ) {
        console.info( 'bifrost server is not running.' );
        return;
    }
    for( let p of list ) {
        console.info( `bifrost server is running:\n Port: ${p.port}\n Pid: ${p.pid}\n Config: ${p.config}` ); 
    }
}

module.exports = {
    cmd : [ 'server' ],
    run( options, config ) {
        const args = options._;
        const cmd = args[ 1 ];

        switch( cmd ) {
            case 'start' : {
                if( options.port ) {
                    options[ 'port-overwritten' ] = 1;
                }
                options.port || ( options.port = config.get( 'server.port' ) );
                start( options, config );
                break;
            }
            case 'stop' :
                stop( options, config );
                break;
            case 'restart' :
                restart( options, config );
                break;
            case 'status' :
                status( options, config );
                break;
            default :
                console.error( `unknown command ${cmd}.` );
                break;
        }
    }
};
