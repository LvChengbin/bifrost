const fs = require( 'fs' );
const path = require( 'path' );
const utils = require( '../shared/utils' );
const console = require( '../shared/console' );

const list = fs.readdirSync( __dirname );

const modules = {};

for( const name of list ) {
    if( name.charAt( 0 ) === '.' ) continue;
    if( name.charAt( 0 ) === '_' ) continue;
    if( !utils.isdir( path.join( __dirname, name ) ) ) continue;
    modules[ name ] = require( `./${name}` );
}

//console.log( modules );

module.exports = options => {

    const cmd = options._[ 0 ];

    if( !cmd ) return modules.cli.run( options );

    for( let name in modules ) {
        const module = modules[ name ];
        if( module.cmd.indexOf( cmd ) < 0 ) continue;
        return module.run( options );
    }

    console.error( `unknow command "${cmd}".` );
};
