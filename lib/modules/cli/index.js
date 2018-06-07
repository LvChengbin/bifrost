const console = require( '../../shared/console' );

module.exports = {
    cmd : [],
    run( options ) {
        console.info( 'running module cli', options );
    }
};
