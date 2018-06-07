const Yolk = require( '@lvchengbin/yolk' );

const app = new Yolk( {
    root : __dirname,
    debugging : true,
    routers() {
        this.router.add( '/', {
            module : 'bifrost',
            controller : 'index',
            action : 'index'
        } );
        this.router.add( '/:module', {
            module : 1,
            controller : 'index',
            action : 'index'
        } );

        this.router.add( '/:module/:controller', {
            module : 1,
            controller : 2,
            action : 'index'
        } );

        this.router.add( '/:module/:controller/:action', {
            module : 1,
            controller : 2,
            action : 3
        } );
    },
    modules : {
        bifrost : 'bifrost'
    }
} );

module.exports = app;
