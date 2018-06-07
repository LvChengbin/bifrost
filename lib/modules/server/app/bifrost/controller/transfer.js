const fs = require( 'fs' );
const path = require( 'path' );
const md5File = require( 'md5-file' );

const utils = require( '../../../../../shared/utils' );

const home = process.env[ 'HOME' ];

module.exports = class extends require( '@lvchengbin/yolk' ).Controller {
    async indexAction() {
        const body = this.ctx.request.body;        
        this.assert( body.files, 400, 'no file uploaded' );
        this.assert( body.files.file, 400, 'file cannot be empty.' );
        this.assert( body.fields.md5, 400, 'md5 must be a string.' );
        this.assert( body.fields.dest, 400, 'dest muse be a string.' );

        let target, overwrite = false;

        let dest;

        if( md5File.sync( body.files.file.path ) !== body.fields.md5 ) {
            this.throw( 400, 'the md5 value does not match' );
        }

        if( body.fields.dest === '~' ) {
            dest = home;
        } else {
            dest = path.resolve( home, body.fields.dest.replace( /^~\/+/, '' ) );
        }

        if( utils.isdir( dest ) ) {
            target = path.join( dest, body.files.file.name );
        } else {
            const dirname = path.resolve( dest );
            if( !utils.isdir( dirname ) ) {
                this.throw( 400, `directory "${dirname}" not exists.` );
            }
            target = path.join( dirname, path.basename( dest ) );
        }

        if( fs.existsSync( target ) ) {
            overwrite = true;
        }

        utils.move( body.files.file.path, target )

        return { target, overwrite };
    }

    async getAction() {
        const file = this.ctx.query.file;
        this.assert( file, 400, 'file must be a string' )  
        const target = path.resolve( home, file.replace( /^~\/+/, '' ) );

        if( !fs.existsSync( target ) ) {
            this.throw( 400, `${file} not exists.` );
        }

        this.ctx.set( 'content-filename', path.basename( file ) );
        this.ctx.set( 'content-MD5', md5File.sync( target ) );

        return this.module.attachment( target );
    }
}
