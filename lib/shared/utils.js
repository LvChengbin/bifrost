const fs = require( 'fs' );
const path = require( 'path' );
const md5File = require( 'md5-file' );

function isdir( ...args ) {
    const file = path.resolve( ...args );
    try {
        const lstat = fs.lstatSync( file );
        return lstat.isDirectory();
    } catch( e ) {
        return false;
    }
}

async function tmpfile( filename, content ) {
    const home = process.env[ 'HOMT' ];
    const dir = path.join( home, '.bifrost' );
    const name = path.basename( filename );
    const target = path.join( dir, name );
    if( !isdir( dir ) ) fs.mkdirSync( dir );
    fs.writeFileSync( target, content );
}

async function move( source, target ) {
    if( fs.existsSync( target ) && isdir( target ) ) {
        target = path.basename( target, source );
    }
    fs.renameSync( source, target );
}

module.exports = { isdir, tmpfile, move };
