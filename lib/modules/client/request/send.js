const fs = require( 'fs' );
const path = require( 'path' );
const ora = require( 'ora' );
const md5File = require( 'md5-file' );
const request = require( 'request-promise-native' );
const console = require( '../../../shared/console' );

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

    const s1 = ora( `calculating md5 value of ${source}` ).start();
    const md5 = md5File.sync( file );
    s1.info( `md5: ${md5}` );

    const i = dest.lastIndexOf( ':' );

    if( i === -1 ) {
        console.error( `"${dest}" is invalid.` );
        return;
    }
    const target = dest.substr( i + 1 );
    const host = dest.substr( 0, i );
    let rhost;

    if( !/^https?:\/\//.test( host ) ) {
        rhost = 'http://' + host;
    }

    const s2 = ora( `sending file ${source} to ${host}.` ).start();

    return request( {
        method : 'POST',
        uri : rhost + '/bifrost/transfer',
        formData : {
            file : fs.createReadStream( file ),
            dest : target,
            md5
        }
    } ).then( res => {
        const json = JSON.parse( res );

        s2.succeed( `finish sending ${source} to ${host}.` );
        if( json.overwrite ) {
            console.warn( `it has overwritten another file on ${host}.` );
        }
    } ).catch( e => {
        const msg = e.message;

        if( e.statusCode == 400 ) {
            s2.fail( msg );
            return;
        }

        if( msg.indexOf( 'ECONNREFUSED' ) > -1 ) {
            s2.fail( `failed to connect to bifrost server on ${host}.` );
            return;
        }
        s2.fail( `failed while sending ${source} to ${host}: ${msg}` );
    } );
}
module.exports = send;
