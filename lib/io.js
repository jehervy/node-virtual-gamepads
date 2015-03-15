var io = {}

io['int']   = 4;
io['char']  = 1;
io['char*'] = 8;

io.UINPUT_IOCTL_BASE = 'U'.charCodeAt();

io._IOC_NONE  = 0;
io._IOC_WRITE = 1;
io._IOC_READ  = 2;

io._IOC_NRBITS	  = 8;
io._IOC_TYPEBITS = 8;

io._IOC_SIZEBITS = 14;
io._IOC_DIRBITS  = 2;

io._IOC_NRMASK   = ((1 << io._IOC_NRBITS   ) -1 );
io._IOC_TYPEMASK = ((1 << io._IOC_TYPEBITS ) -1 );
io._IOC_SIZEMASK = ((1 << io._IOC_SIZEBITS ) -1 );
io._IOC_DIRMASK  = ((1 << io._IOC_DIRBITS  ) -1 );
 
io._IOC_NRSHIFT    = 0;
io._IOC_TYPESHIFT  = ( io._IOC_NRSHIFT   + io._IOC_NRBITS   );
io._IOC_SIZESHIFT  = ( io._IOC_TYPESHIFT + io._IOC_TYPEBITS );
io._IOC_DIRSHIFT   = ( io._IOC_SIZESHIFT + io._IOC_SIZEBITS );



io.sizeof = function(n){
	switch ( typeof n ){
		case 'number':
			return n;
		case 'string':
			return n.length;
		case 'object':
			return n.length ? n.length : 0;
		case 'undefined':
			return 0;
	}
}



io._IOC = function( dir, type, nr,size ) {
	return 	(( dir  << io._IOC_DIRSHIFT  ) |
	    	 ( type << io._IOC_TYPESHIFT ) |
	    	 ( nr   << io._IOC_NRSHIFT   ) |
	    	 ( size << io._IOC_SIZESHIFT ) );
}


io._IOC_TYPECHECK = function( t ) {
	return io.sizeof(t);
}


io._IO = function( type, nr ) {
	return io._IOC( io._IOC_NONE, type, nr, 0 );
}

io._IOR = function( type, nr, size) {
	return io._IOC( io._IOC_READ, type, nr, io._IOC_TYPECHECK(size) );
}

io._IOW = function( type, nr, size ) {
	return io._IOC( io._IOC_WRITE, type, nr, io._IOC_TYPECHECK(size));
}

io._IOWR = function( type, nr, size ) { 
	return io._IOC( io._IOC_READ | io._IOC_WRITE, type, nr, io._IOC_TYPECHECK(size));
}

io._IOR_BAD = function( type, nr, size ) {
	return io._IOC( io._IOC_READ, type, nr, io.sizeof(size));
}

io._IOW_BAD = function( type, nr, size ) {
	return io._IOC( io._IOC_WRITE, type, nr, io.sizeof(size));
}

io._IOWR_BAD = function( type, nr, size ) {
	return io._IOC( io._IOC_READ | io._IOC_WRITE, type, nr, io.sizeof(size));
}



/* used to decode ioctl numbers.. */
io._IOC_DIR = function( nr ) {
	return ( nr >> io._IOC_DIRSHIFT ) & io._IOC_DIRMASK;
}

io._IOC_TYPE = function( nr ) {
	return ( nr >> io._IOC_TYPESHIFT ) & io._IOC_TYPEMASK;
}

io._IOC_NR = function( nr ) {
	return ( nr >> io._IOC_NRSHIFT ) & io._IOC_NRMASK;
}

io._IOC_SIZE = function( nr ) {
	return ( nr >> io._IOC_SIZESHIFT ) & io._IOC_SIZEMASK;
}


module.exports = io;