var ugpio = {

	epoll: require( 'epoll' ).Epoll,
	fs: require( 'fs' ),
	poller_timeout: null,

	export: function( pin ) {
		if( ! ugpio.fs.existsSync( '/sys/class/gpio/gpio'+pin+'/value' ) ) ugpio.fs.writeFileSync( '/sys/class/gpio/export', pin );
	},

	unexport: function( pin ) {
		if( ugpio.fs.existsSync( '/sys/class/gpio/gpio'+pin+'/value' ) ) ugpio.fs.writeFileSync( '/sys/class/gpio/unexport', pin );
	},

	get: function( pin ) {
		ugpio.export( pin );
		return ugpio.fs.readFileSync( '/sys/class/gpio/gpio'+pin+'/value', 'utf8' ).trim();
	},

	setDirection: function( pin, direction ) {
		ugpio.export( pin );
		return ugpio.fs.writeFileSync( '/sys/class/gpio/gpio'+pin+'/direction', direction );
	},

	setEdge: function( pin, mode ) {
		ugpio.export( pin );
		return ugpio.fs.writeFileSync( '/sys/class/gpio/gpio'+pin+'/edge', mode );
	},

	set: function( pin, status ) {
		ugpio.setDirection( pin, 'out' );
		ugpio.fs.writeFileSync( '/sys/class/gpio/gpio'+pin+'/value', status );
	},

	watch: function( pin, fx, mode ) {
		ugpio.setDirection( pin, 'in' );
		ugpio.setEdge( pin, mode ? mode : 'both' );

		var vfd = ugpio.fs.openSync( '/sys/class/gpio/gpio'+pin+'/value', 'r' );
		var buffer = new Buffer( 1 );

		var poller = new ugpio.epoll( function( err, fd, events ) {
			ugpio.fs.readSync( fd, buffer, 0, 1, 0 );

			if( buffer.toString() == ugpio.last ) return;

			ugpio.last = buffer.toString();

			if( ugpio.poller_timeout ) clearTimeout( ugpio.poller_timeout );
			ugpio.poller_timeout = setTimeout( function() {
				fx( ugpio.get( pin ) );
			}, 300 );
		} );

		ugpio.fs.readSync( vfd, buffer, 0, 1, 0);
		ugpio.last = buffer.toString();

		//poller.remove( vfd ).close();
		poller.add( vfd, ugpio.epoll.EPOLLPRI );
	}
}

module.exports = ugpio;
