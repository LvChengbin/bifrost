const fs = require( 'fs' );
const path = require( 'path' );
const ora = require( 'ora' );
const md5File = require( 'md5-file' );
const uniqid = require( 'uniqid' );
const request = require( 'request-promise-native' );
const console = require( '../../../shared/console' );
const utils = require( '../../../shared/utils' );
const settings = require( '../../../shared/settings' );

async function send( options, config ) {
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
    let file = path.resolve( cwd, source );

    if( !fs.existsSync( file ) ) {
        console.error( `file "${source}" not exists.` );
        return;
    }
    const i = dest.lastIndexOf( ':' );

    if( i === -1 ) {
        console.error( `"${dest}" is invalid.` );
        return;
    }
    const target = dest.substr( i + 1 );
    const server = dest.substr( 0, i );

    const conf = config.get( `client.servers.${server}`, {
        host : server
    } );

    options.user && ( conf.user = options.user );
    options.pass && ( conf.pass = options.pass );

    if( !/^https?:\/\//.test( conf.host ) ) {
        conf.host = 'http://' + conf.host;
    }

    const s2 = ora( `sending file ${source} to ${conf.host}.` ).start();
    const name = path.basename( file );

    let compressed = 0;

    /**
     * to compress the dir
     */
    if( utils.isdir( file ) ) {
        const dest = path.join( settings.tmp, `client.${uniqid()}.${name}.tgz` );
        const s = ora( 'packing files...' ).start();
        await utils.tarc( file, dest );
        s.succeed( 'packing files...done!' );
        compressed = 1;
        file = dest;
    }

    const s1 = ora( `calculating md5 value of ${source}` ).start();
    const md5 = md5File.sync( file );
    s1.succeed( `md5: ${md5}` );

    return request( {
        method : 'POST',
        uri : conf.host + '/bifrost/transfer',
        headers : {
            Authorization : `${conf.user} ${conf.pass}`
        },
        formData : {
            file : fs.createReadStream( file ),
            dest : target,
            compressed,
            name,
            md5
        }
    } ).then( res => {
        const json = JSON.parse( res );

        s2.succeed( `finish sending ${source} to ${conf.host}.` );
        if( json.overwrite ) {
            console.warn( `it has overwritten another file on ${conf.host}.` );
        }
    } ).catch( e => {
        const msg = e.message;

        if( e.statusCode == 400 ) {
            s2.fail( msg );
            return;
        }

        if( msg.indexOf( 'ECONNREFUSED' ) > -1 ) {
            s2.fail( `failed to connect to bifrost server on ${conf.host}.` );
            return;
        }
        s2.fail( `failed while sending ${source} to ${conf.host}: ${msg}` );
    } );
}
module.exports = send;
