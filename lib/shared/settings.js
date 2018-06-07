const path = require( 'path' );

const home = process.env[ 'HOME' ];
const rc = path.join( home, '.bifrost' );

module.exports = {
    rc,
    tmp : path.join( rc, 'tmp' )
};
