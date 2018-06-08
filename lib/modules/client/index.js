const console = require( '../../shared/console' );
const request = require( './request' );

module.exports = {
    cmd : [ 'send', 'get', 'run' ],
    run( options, config ) {
        const args = options._;
        const cmd = args[ 0 ];

        switch( cmd ) {
            case 'send' :
                request.send( options, config );
                break;
            case 'get' :
                request.get( options, config );
                break;
            default :
                console.error( `unknown command ${cmd}.` );
                break;
        }
    }
};
