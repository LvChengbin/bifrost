const args = require( 'yargs' ).argv;
const app = require( './app' );
app.listen( args.port );
