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
