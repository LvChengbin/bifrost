const fs = require( 'fs' );
const path = require( 'path' );
const ora = require( 'ora' );
const request = require( 'request' );
const console = require( '../../../shared/console' );
const utils = require( '../../../shared/utils' );

function execute( options ) {
    let { host, target, file, user, pass } = options;
    const cwd = process.cwd();

    const s1 = ora( `getting file ${file} from ${host}.` ).start();
    const req = request.get( host + '/bifrost/transfer/get', {
        headers : {
            'Authorization' : `${user} ${pass}`
        },
        qs : { file }
    } ).on( 'response', async res => {
        const headers = res.headers;
        const name = headers[ 'content-filename' ];
        const rmd5 = headers[ 'content-md5' ];
        const compressed = headers[ 'content-compressed' ];
        const attachment = utils.attachmentName( headers[ 'content-disposition' ] );

        s1.succeed( `finish getting ${file} from ${host}.` );

        const msg = `checking file with md5: ${rmd5}...`;
        const s2 = ora( msg ).start();

        let tmp;
        if( compressed == 1 ) {
            tmp = await utils.tmpSave( req, attachment );
        } else {
            tmp = await utils.tmpSave( req, name );
        }

        if( tmp.md5 === rmd5 ) {
            s2.succeed( msg + 'passed!' );
        } else {
            s2.fail( msg + 'failed!' );
            return;
        }

        if( !target ) {
            target = path.join( cwd, name );
        } else if( fs.existsSync( target ) && utils.isdir( target ) ) {
            target = path.join( target, name );
        }

        if( compressed == 1 ) {
            return utils.tarx( tmp.file, path.dirname( target ) );
        } else {
            return utils.move( tmp.file, target );
        }
    } ).on( 'error', e => {
        const msg = e.message;

        if( e.statusCode === 400 ) {
            s1.fail( e.message );
            return;
        }

        if( msg.indexOf( 'ECONNREFUSED' ) > -1 ) {
            s1.fail( `failed to connect to bifrost on ${host}.` );
            return;
        }
        s1.fail( `failed to get ${file} from ${host}: ${msg}.` );
    } );
}

/**
 * get alias:file.txt
 * get alias:file.txt ~/path
 * get 127.0.0.1:file.text
 */
module.exports = async ( options, config ) => {
    const cmd = options._;
    if( cmd.length < 2 ) {
        console.error( 'no server and file specified.' );
        return;
    }

    let server, file, target;
    const remote = cmd[ 1 ];
    const i = cmd[ 1 ].lastIndexOf( ':' );
    if( i === -1 ) {
        console.error( `"${remote}" is invalid.` );
        return;
    }
    server = remote.substr( 0, i );
    file = remote.substr( i + 1 );

    target = cmd[ 2 ] || null;

    let conf = config.get( `client.servers.${server}`, {
        host : server
    } );

    if( !/^https?:\/\//.test( conf.host ) ) {
        conf.host = 'http://' + conf.host;
    }

    options.user && ( conf.user = options.user );
    options.pass && ( conf.pass = options.pass );

    conf.target = target;
    conf.file = file;
    return execute( conf );
};
