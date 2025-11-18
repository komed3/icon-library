#!/usr/bin/env node

/**
 * Icon Pack Builder Script
 * Scans the icons/ directory structure and generates JSON index file
 * for the SVG icon download website
 */

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

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

/**
 * Scan a directory and return icon pack information
 */
function scanIconPack ( packPath, packName ) {

    try {

        const files = readdirSync( packPath );
        const svgFiles = files.filter( file => file.endsWith( '.svg' ) );

        let totalSize = 0;
        const icons = [];

        svgFiles.forEach( file => {

            const filePath = join( packPath, file );
            const stats = statSync( filePath );
            totalSize += stats.size;

            const iconData = parseIconFilename( file );
            icons.push( iconData );

        } );

        // Sort icons by ID if available, otherwise by filename
        icons.sort( ( a, b ) => {
            if ( a.id !== null && b.id !== null ) return a.id - b.id;
            return a.filename.localeCompare( b.filename );
        } );

        return {
            name: packName,
            path: relative( ICONS_DIR, packPath ),
            iconCount: svgFiles.length,
            totalSize: totalSize,
            formattedSize: formatFileSize( totalSize ),
            icons: icons
        };

    } catch ( err ) {

        console.error( `Error scanning pack ${packName}:`, err.message );
        return null;

    }

}
