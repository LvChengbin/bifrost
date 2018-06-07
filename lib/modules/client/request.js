const fs = require( 'fs' );
const path = require( 'path' );
const request = require( 'request-promise-native' );
const console = require( '../../shared/console' );

async function send( options ) {
    const cmd = options._;
    if( cmd.length < 2 ) {
        console.error( 'no file specified.' );
        return;
    }

    if( cmd.length < 3 ) {
        console.error( 'no specified target file or directory.' );
        return;
    }
    const [ , source, dest ] = cmd;
    const cwd = process.cwd();

    const file = path.resolve( cwd, source );

    if( !fs.existsSync( file ) ) {
        console.error( `file "${source}" not exists.` );
        return;
    }

    const i = dest.lastIndexOf( ':' );
    const target = dest.substr( i + 1 );
    let host = dest.substr( 0, i );

    if( /^https?:\/\//.test( host ) ) {
        host = 'http://' + host;
    }

    const res = await request( {
        method : 'POST',
        uri : host + '/bifrost/transfer',
        formData : {
            file : fs.createReadStream( file ),
            dest : target
        }
    } ).catch( e => {
        console.error( e );
    } );

    console.log( res );
    
}

async function get( options ) {
    
}

module.exports = { send, get };
