const fs = require( 'fs' );
const path = require( 'path' );

module.exports.isdir = ( ...args ) => {
    const file = path.resolve( ...args );
    try {
        const lstat = fs.lstatSync( file );
        return lstat.isDirectory();
    } catch( e ) {
        return false;
    }
};
