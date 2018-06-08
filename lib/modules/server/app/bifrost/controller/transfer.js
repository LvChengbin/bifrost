const fs = require( 'fs' );
const path = require( 'path' );
const md5File = require( 'md5-file' );
const uniqid = require( 'uniqid' );
const utils = require( '../../../../../shared/utils' );
const settings = require( '../../../../../shared/settings' );
const console = require( '../../../../../shared/console' );

const home = process.env[ 'HOME' ];

module.exports = class extends require( '@lvchengbin/yolk' ).Controller {
    async indexAction() {
        const body = this.ctx.request.body;        
        this.assert( body.files, 400, 'no file uploaded' );
        this.assert( body.files.file, 400, 'file cannot be empty.' );
        this.assert( body.fields.md5, 400, 'md5 must be a string.' );
        this.assert( body.fields.dest, 400, 'dest muse be a string.' );

        let dest, target, overwrite = false;

        if( md5File.sync( body.files.file.path ) !== body.fields.md5 ) {
            this.throw( 400, 'the md5 value does not match' );
        }

        if( body.fields.dest === '~' ) {
            dest = home;
        } else {
            dest = path.resolve( home, body.fields.dest.replace( /^~\/+/, '' ) );
        }

        if( utils.isdir( dest ) ) {
            if( body.fields.compressed == 1 ) {
                target = dest;
            } else {
                target = path.join( dest, body.files.file.name );
            }
        } else {
            const dirname = path.resolve( dest );
            if( !utils.isdir( dirname ) ) {
                this.throw( 400, `directory "${dirname}" not exists.` );
            }
            target = path.join( dirname, path.basename( dest ) );
        }

        if( fs.existsSync( target ) && body.fields.compressed == 0 ) {
            overwrite = true;
        }

        console.info( target );

        if( body.fields.compressed == 1 ) {
            await utils.tarx( body.files.file.path, target );
        } else {
            utils.move( body.files.file.path, target )
        }
        return { target, overwrite };
    }

    async getAction() {
        const file = this.ctx.query.file;
        this.assert( file, 400, 'file must be a string' )  
        let target = path.resolve( home, file.replace( /^~\/+/, '' ) );
        const name = path.basename( file );

        if( !fs.existsSync( target ) ) {
            this.throw( 400, `${file} not exists.` );
        }

        if( utils.isdir( target ) ) {
            const dest = path.join( settings.tmp, `server.${uniqid()}.${name}.tgz`);
            await utils.tarc( target, dest );
            this.ctx.set( 'content-compressed', 1 );
            target = dest;
        }

        this.ctx.set( 'content-filename', name );
        this.ctx.set( 'content-MD5', md5File.sync( target ) );
        return this.module.attachment( target );
    }
}
