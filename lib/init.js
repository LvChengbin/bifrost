const fs = require( 'fs' );
const utils = require( './shared/utils' );
const settings = require( './shared/settings' );

module.exports = () => {
    if( !utils.isdir( settings.rc ) ) {
        fs.mkdirSync( settings.rc );
    }

    if( !utils.isdir( settings.tmp ) ) {
        fs.mkdirSync( settings.tmp );
    }
};
