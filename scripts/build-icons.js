#!/usr/bin/env node

/**
 * Icon Pack Builder Script
 * Scans the icons/ directory structure and generates JSON index file
 * for the SVG icon download website
 */

import {} from 'node:fs';
import {} from 'node:path';

const ICONS_DIR = '../icons';
const OUTPUT_FILE = '../icons-data.json';

/**
 * Get file size in human readable format
 */
function formatFileSize ( bytes ) {

    if ( bytes === 0 ) return '0 Bytes';

    const k = 1024;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[ i ];

}

/**
 * Parse icon filename to extract ID and description
 * Expected format: [ID]_[description].svg
 */
function parseIconFilename ( filename ) {

    const match = filename.match( /^(\d+)_(.+)\.svg$/ );
    const capitalizeName = ( name ) => name.split( '_' ).map(
        word => word.charAt( 0 ).toUpperCase() + word.slice( 1 )
    ).join( ' ' );

    if ( match ) return {
        id: parseInt( match[ 1 ] ),
        description: capitalizeName( match[ 2 ] ),
        filename: filename
    };

    return {
        id: null,
        description: capitalizeName( filename.replace( '.svg', '' ) ),
        filename: filename
    };

}
