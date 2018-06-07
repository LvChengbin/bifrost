const fs = require( 'fs' );
const path = require( 'path' );
const crypto = require( 'crypto' );
const ora = require( 'ora' );
const request = require( 'request-promise-native' );
const console = require( '../../../shared/console' );
const utils = require( '../../../shared/utils' );


async function get( options ) {
    const cmd = options._;
    if( cmd.length < 2 ) {
        console.error( 'no server and file specified.' );
        return;
    }

    let server, file, rhost, target;
    const cwd = process.cwd();
    const remote = cmd[ 1 ];

    const i = cmd[ 1 ].lastIndexOf( ':' );
    if( i === -1 ) {
        console.error( `"${remote}" is invalid.` );
        return;
    }
    server = remote.substr( 0, i );
    file = remote.substr( i + 1 );

    target = cmd[ 2 ] || null;

    if( !/^https?:\/\//.test( server ) ) {
        rhost = 'http://' + server;
    }

    const s1 = ora( `getting file ${file} from ${server}.` ).start();
    return request( {
        method : 'GET',
        uri : rhost + '/bifrost/transfer/get',
        resolveWithFullResponse : true,
        qs : {
            file 
        }
    } ).then( res => {
        const headers = res.headers;
        const name = headers[ 'content-filename' ];
        const rmd5 = headers[ 'content-md5' ];
        const lmd5 = crypto.createHash( 'md5' ).update( res.body ).digest( 'hex' );

        if( rmd5 !== lmd5 ) {
            s1.fail( `the file "${file}" is broken.` );
            return;
        }

        if( !target ) {
            target = path.join( cwd, name );
        } else if( fs.existsSync( target ) && utils.isdir( target ) ) {
            target = path.join( target, name );
        }
        fs.writeFileSync( target, res.body );
        s1.succeed( `finish getting ${file} from ${server}.` );
    } ).catch( e => {
        const msg = e.message;

        if( e.statusCode === 400 ) {
            s1.fail( e.message );
            return;
        }

        if( msg.indexOf( 'ECONNREFUSED' ) > -1 ) {
            s1.fail( `failed to connect to bifrost server on ${server}.` );
        }
        s1.fail( `failed to get ${file} from ${server}: ${msg}.` );
    } );

}
module.exports = get;
