const util = require( 'util' );
const chalk = require( 'chalk' );
const is = require( '@lvchengbin/is' );

function inspect( ...args ) {
    const res = [];
    for( let arg of args ) {
        if( is.object( arg ) ) {
            res.push( util.inspect( arg ) );
        } else {
            res.push( arg );
        }
    }
    return res;
}

/**
 * to wrap the instance of Console class with Proxy for checking if the debugging mode is on before printing logs.
 */
class Console {
    constructor( instance ) {

        const get = function( obj, prop ) {
            if( !is.function( console[ prop ] ) ) {
                return console[ prop ];
            }

            if( !instance.debugging ) return () => {};

            const tag = '[bifrost] ';

            return ( ...args ) => {
                const colors = Console.COLORS;

                const content = chalk.hex( colors[ prop ] || '#FFFFFF' )( ...( inspect( ...args ) ) );
                console[ prop ].call( console, chalk.hex( colors.$tag || colors[ prop ] )( tag ), content );
            };
        };
        return new Proxy( {}, { get } );
    }
}

Console.COLORS = {
    $tag : '#ce0d0d',
    log : '#008000',
    info : '#00ffff',
    warn : '#FFA500',
    error : '#FF0000',
    debug : '#FFFF00'
};

module.exports = new Console( { debugging : true } );
