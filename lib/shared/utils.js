const fs = require( 'fs' );
const path = require( 'path' );
const stream = require( 'stream' );
const tar = require( 'tar' );
const uniqid = require( 'uniqid' );
const md5File = require( 'md5-file' );
const settings = require( './settings' );

function isdir( ...args ) {
    const file = path.resolve( ...args );
    try {
        const lstat = fs.lstatSync( file );
        return lstat.isDirectory();
    } catch( e ) {
        return false;
    }
}

async function tmpSave( content, filename ) {
    const name = uniqid() + '.' + filename;
    const file = path.join( settings.tmp, name );

    if( content instanceof stream.Stream ) {
        return new Promise( ( resolve, reject ) => {
            const ws = fs.createWriteStream( file ); 
            ws.on( 'error', e => {
                console.error( e );
                reject( e );
            } );
            ws.on( 'close', () => {
                resolve( { file, md5 : md5File.sync( file ) } ); 
            } );

            content.pipe( ws );
        } );
    }
    fs.writeFileSync( file, content );
    return { file, md5 : md5File.sync( file ) };
}

async function move( source, target ) {
    if( fs.existsSync( target ) && isdir( target ) ) {
        target = path.basename( target, source );
    }
    fs.renameSync( source, target );
}

function attachmentName( str ) {
    return str.replace( /^.*?filename="(.*?)"/i, '$1' );
}

async function tarc( dir, dest ) {
    return tar.c( {
        gzip : true,
        file : dest,
        cwd : path.dirname( dir )
    }, [ path.basename( dir ) ] );
}

async function tarx( file, dest ) {
   return tar.x( { file, C : dest } ); 
}

module.exports = { isdir, tmpSave, move, attachmentName, tarc, tarx };
