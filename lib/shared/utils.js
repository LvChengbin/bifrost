const fs = require( 'fs' );
const path = require( 'path' );
const stream = require( 'stream' );
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
    const target = path.join( settings.tmp, name );

    if( content instanceof stream.Stream ) {
        return new Promise( ( resolve, reject ) => {
            const ws = fs.createWriteStream( target ); 
            ws.on( 'error', e => {
                console.error( e );
                reject( e );
            } );
            ws.on( 'close', () => {
                resolve( { name, md5 : md5File.sync( target ) } ); 
            } );

            content.pipe( ws );
        } );
    }
    fs.writeFileSync( target, content );
    return { name, md5 : md5File.sync( target ) };
}

async function move( source, target ) {
    if( fs.existsSync( target ) && isdir( target ) ) {
        target = path.basename( target, source );
    }
    fs.renameSync( source, target );
}

module.exports = { isdir, tmpSave, move };
