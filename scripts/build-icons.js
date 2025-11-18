#!/usr/bin/env node

/**
 * Icon Pack Builder Script
 * Scans the icons/ directory structure and generates JSON index file
 * for the SVG icon download website
 */

import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ICONS_DIR = './icons';
const OUTPUT_FILE = './icons-data.json';

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

/**
 * Main function to scan all icon packs
 */
function buildIconIndex () {

    console.log( 'Scanning icon packs ...' );

    // Check if icons directory exists
    if ( ! existsSync( ICONS_DIR ) ) {

        console.error( `Icons directory '${ICONS_DIR}' not found!` );
        console.log( 'Please create the icons directory and place your icon packs inside.' );
        process.exit( 1 );

    }

    const items = readdirSync( ICONS_DIR );
    const iconPacks = [];
    let totalIcons = 0;
    let totalSize = 0;

    items.forEach( item => {

        const itemPath = join( ICONS_DIR, item );
        const stats = statSync( itemPath );

        if ( stats.isDirectory() ) {

            console.log( `Processing: ${item}` );
            const packData = scanIconPack( itemPath, item );

            if ( packData && packData.iconCount > 0 ) {

                iconPacks.push( packData );
                totalIcons += packData.iconCount;
                totalSize += packData.totalSize;

            }

        }

    } );

    // Sort packs alphabetically
    iconPacks.sort( ( a, b ) => a.name.localeCompare( b.name ) );

    const indexData = {
        generated: new Date().toISOString(),
        totalPacks: iconPacks.length,
        totalIcons: totalIcons,
        totalSize: totalSize,
        formattedTotalSize: formatFileSize( totalSize ),
        packs: iconPacks
    };

    // Write JSON file
    writeFileSync( OUTPUT_FILE, JSON.stringify( indexData, null, 2 ) );

    console.log( '\nBuild completed successfully!' );
    console.log( 'Statistics:' );
    console.log( `> Total packs: ${indexData.totalPacks}` );
    console.log( `> Total icons: ${indexData.totalIcons}` );
    console.log( `> Total size: ${indexData.formattedTotalSize}` );
    console.log( `Data saved to: ${OUTPUT_FILE}` );

    return indexData;

}

// Run the script or export methods
if ( process.argv.includes( '--run' ) ) buildIconIndex();
export { buildIconIndex, scanIconPack, parseIconFilename };
