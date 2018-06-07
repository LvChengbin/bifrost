const fs = require( 'fs' );
const path = require( 'path' );

const utils = require( '../../../../../shared/utils' );

const home = process.env[ 'HOME' ];

module.exports = class extends require( '@lvchengbin/yolk' ).Controller {
    async indexAction() {
        const body = this.ctx.request.body;        
        this.assert( body.files, 400, 'no file uploaded' );
        this.assert( body.files.file, 400, 'file cannot be empty.' );

        let target, overwrite = false;

        let dest;

        if( body.fields.dest === '~' ) {
            dest = home;
        } else {
            dest = path.resolve( home, body.fields.dest.replace( /^~\/+/, '' ) || '' );
        }

        if( utils.isdir( dest ) ) {
            target = path.join( dest, body.files.file.name );
        } else {
            const dirname = path.resolve( dest );
            if( !utils.isdir( dirname ) ) {
                this.throw( 400, `directory ${dirname} not exists.` );
            }
            target = path.join( dirname, path.basename( dest ) );
        }

        if( fs.existsSync( target ) ) {
            overwrite = true;
        }

        /**
         * to read content of the uploaded file.
         */
        const rs = fs.createReadStream( body.files.file.path ).on( 'error', e => {
            this.throw( 500, `failed to read the uploaded file: ${e.message}` );
        } );

        this.console.info( `writing file to ${target}` );
        /**
         * write to the dest file
         */
        const ws = fs.createWriteStream( target ).on( 'error', e => {
            this.throw( 500, `failed to write to ${target}: ${e.message}.` );
        } );

        return new Promise( resolve => {
            rs.pipe( ws.on( 'close', () => {
                this.console.info( `finish writing file into ${target}` );
                resolve( { target, overwrite } ); 
            } ) );
        } );
    }
}
