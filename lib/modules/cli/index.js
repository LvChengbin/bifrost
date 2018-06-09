const { exec } = require( 'child_process' );
const settings = require( '../../shared/settings' );

function clean() {
    const tmpdir = settings.tmp;
    exec( `rm -rf ${tmpdir}`, {
        stdio : 'inherit'
    } ); 
}

module.exports = {
    cmd : [ 'clean' ],
    run( options, config ) {
        const args = options._;
        const cmd = args[ 0 ];

        switch( cmd ) {
            case 'clean' :
                clean( options, config ); 
                break;
        }
    }
};
