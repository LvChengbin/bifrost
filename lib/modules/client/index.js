const console = require( '../../shared/console' );
const request = require( './request' );

module.exports = {
    cmd : [ 'send', 'get', 'run' ],
    run( options ) {
        const args = options._;
        const cmd = args[ 0 ];

        switch( cmd ) {
            case 'send' :
                request.send( options );
                break;
            case 'get' :
                request.get( options );
                break;
            default :
                console.error( `unknown command ${cmd}.` );
                break;
        }
    }
};
