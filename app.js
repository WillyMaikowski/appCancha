var express 		= require( 'express' );
var logger 			= require( 'morgan' );
var bodyParser 	= require( 'body-parser' );
var ugpio				= require( './ugpio' );

var app = express();
app.use( logger('dev') );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

app.get( '/sms', function( req, res, next ) {
	res.send( 'Hello World!' );
} );

app.use( function( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

app.use( function( err, req, res, next ) {
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: err //{}
  } );
} );


module.exports = app;
