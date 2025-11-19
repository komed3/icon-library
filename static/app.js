/**
 * SVG Icon Library Application
 */

class IconLibrary {

    constructor () {

        this.iconData = null;
        this.currentPack = null;
        this.currentView = 'main';
        this.searchQuery = '';
        this.searchFilter = 'all';

        this.numFormatter = new Intl.NumberFormat( navigator.language || 'en-US' );
        this.init();

    }

    byId ( id ) { return document.getElementById( id ) }

    setView ( viewId ) {

        [ 'packs', 'icons', 'results', 'error', 'loading' ].forEach( v => {
            const el = this.byId( v ); if ( el ) {
                if ( v === viewId ) el.style.removeProperty( 'display' );
                else el.style.display = 'none';
            }
        } );

    }

    formatNumber ( n ) { return typeof n === 'number' ? this.numFormatter.format( n ) : n }

    async init () {

        this.setupEventListeners();
        await this.loadIconData();

    }

    setupEventListeners () {}

    async loadIconData () {

        try {

            const res = await fetch( 'icons-data.json' );
            if ( ! res.ok ) throw new Error( `HTTP error! status: ${res.status}` );

            this.iconData = await res.json();
            this.showMainView();

        } catch ( err ) {

            console.error( 'Error loading icon data:', err );
            this.setView( 'error' )

        }

    }

    showMainView () {

        this.currentView = 'main';
        this.currentPack = null;
        this.setView( 'packs' );

        const searchInput = this.byId( 'search-input' );
        searchInput.value = '';
        this.searchQuery = '';

        if ( this.iconData ) {

            this.byId( 'pack-count' ).textContent = `${ this.formatNumber( this.iconData.totalPacks ) } packs`;
            this.byId( 'icon-count' ).textContent = `${ this.formatNumber( this.iconData.totalIcons ) } icons`;
            this.byId( 'total-size' ).textContent = this.iconData.formattedTotalSize;

            this.renderPacks();

        }

    }

    showPackView ( packName ) {

        const pack = this.iconData.packs.find( p => p.name === packName );
        if ( ! pack ) return;

        this.currentPack = pack;
        this.currentView = 'pack';
        this.setView( 'icons' );

        this.byId( 'pack-name' ).textContent = pack.name;
        this.byId( 'pack-icon-count' ).textContent = `${ this.formatNumber( pack.iconCount ) } icons`;
        this.byId( 'pack-size' ).textContent = pack.formattedSize;
        this.byId( 'icon-search-input' ).value = '';

        this.renderIcons( pack.icons );

    }

    renderPacks () {

        this.byId( 'packs-grid' ).innerHTML = this.iconData?.packs.length
            ? this.iconData.packs.map( p => this.packCardHtml( p ) ).join( '' )
            : '<p>No icon packs found.</p>';

    }

    renderIcons ( icons ) {

        this.byId( 'icons-grid' ).innerHTML = icons?.length
            ? icons.map( i => this.iconCardHtml( i, this.currentPack.path ) ).join( '' )
            : '<p>No icons found.</p>';

    }

    packCardHtml ( pack ) {

        return `<div class="pack-card">` +
            `<div class="pack-header">` +
                `<h3 class="pack-title">${pack.name}</h3>` +
                `<div class="pack-meta">` +
                    `<span>${ this.formatNumber( pack.iconCount ) } icons</span>` +
                    `<span>•</span>` +
                    `<span>${pack.formattedSize}</span>` +
                `</div>` +
            `</div>` +
            `<div class="pack-actions">` +
                `<button data-action="show-pack" data-pack="${pack.name}">View Icons</button>` +
                `<button data-action="download-pack" data-pack="${pack.name}">Download Pack</button>` +
            `</div>` +
        `</div>`;

    }

    iconCardHtml ( icon, packPath, packName ) {

        const path = packPath || this.currentPack?.path || '';

        return `<div class="icon-card">` +
            `<div class="icon-preview">` +
                `<img src="icons/${path}/${icon.filename}" alt="${desc}" loading="lazy" />` +
            `</div>` +
            `<div class="icon-name">${icon.description}</div>` +
            `<div class="icon-actions">` +
                `<button data-action="download-icon" data-filename="${icon.filename}" data-packpath="${path}">Download</button>` +
                `<button data-action="copy-svg" data-filename="${icon.filename}" data-packpath="${path}">Copy SVG</button>` +
                packName ? `<button class="pack-name" data-action="show-pack" data-pack="${packName}">${packName}</button>` : '' +
            `</div>` +
        `</div>`;

    }

}

document.addEventListener( 'DOMContentLoaded', () => {
    window.app = new IconLibrary();
} );
