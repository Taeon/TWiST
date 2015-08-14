(function (global) {

	TwistUtilities = {
		ZeroPad:function( number, width ){
			width -= number.toString().length;
			if ( width > 0 )
			{
				return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
			}
			return number + ""; // always return a string
		},
		/**
		 * Convert total minutes to a time string
		 */
		MinutesToTime:function( minutes ){
			return Math.floor( minutes / 60 ) + 'h' + this.ZeroPad( minutes % 60, 2 ) + 'm';
		},
		/**
 		 * Convert string to RGB value for styling
 		 */
 		 StringToRGB:function( string ){
			var rgb = parseInt( string.toLowerCase().replace( /[^a-z]*/gi, '' ), 35 ) % ( 255 * 255 * 255);
			var red = (rgb >> 16) & 0xFF;
			var green = (rgb >> 8) & 0xFF;
			var blue = rgb & 0xFF;
			return 'rgb(' + red + ',' + green + ',' + blue + ')';
 		 }
	}

	if (typeof exports !== 'undefined') {
		module.exports = TwistUtilities;
	}

	global.TwistUtilities = TwistUtilities;
})(this);
