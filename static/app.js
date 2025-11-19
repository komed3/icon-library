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

    // Helper

    byId ( id ) { return document.getElementById( id ) }

    setView ( viewId ) {

        [ 'packs', 'icons', 'results', 'error', 'loading' ].forEach( v => {
            const el = this.byId( v ); if ( el ) {
                if ( v === viewId ) el.style.removeProperty( 'display' );
                else el.style.display = 'none';
            }
        } );

    }

    clearInput () {

        document.querySelectorAll( 'input[type="text"]' ).forEach( el => el.value = '' );
        this.searchQuery = '';

    }

    formatNumber ( n ) { return typeof n === 'number' ? this.numFormatter.format( n ) : n }

    // Initialize

    async init () {

        this.setupEventListeners();
        await this.loadIconData();

    }

    setupEventListeners () {

        this.byId( 'search-input' )?.addEventListener( 'input', ( e ) => this.handleSearch( e.target.value ) );
        this.byId( 'icon-search-input' )?.addEventListener( 'input', ( e ) => this.filterIcons( e.target.value ) );
        this.byId( 'back-btn' )?.addEventListener( 'click', () => this.showMainView() );
        this.byId( 'download-pack-btn' )?.addEventListener( 'click', () => this.downloadPack() );

        document.querySelectorAll( '.filter-btn' ).forEach( btn =>
            btn.addEventListener( 'click', ( e ) => this.setSearchFilter( e.target.dataset.filter ) )
        );

        document.addEventListener( 'keydown', ( e ) => {
            if ( e.key === 'Escape' && this.currentView !== 'main' ) this.showMainView();
            if ( ( e.ctrlKey || e.metaKey ) && e.key === 'k' ) {
                e.preventDefault(); this.byId( 'search-input' ).focus();
            }
        } );

        document.body.addEventListener( 'click', ( e ) => {

            const btn = e.target.closest( 'button[data-action]' );
            if ( ! btn ) return;

            const { action, pack, filename, packpath } = btn.dataset;
            const actions = {
                'show-pack': () => this.showPackView( pack ),
                'download-pack': () => this.downloadPack( pack ),
                'download-icon': () => this.downloadIcon( filename, packpath ),
                'copy-svg': () => this.copySvgCode( filename, packpath )
            };

            actions[ action ]?.();

        } );

    }

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

    // Views

    showMainView () {

        this.currentView = 'main';
        this.currentPack = null;
        this.setView( 'packs' );
        this.clearInput();

        if ( this.iconData ) {

            this.byId( 'pack-count' ).textContent = `${ this.formatNumber( this.iconData.totalPacks ) } packs`;
            this.byId( 'icon-count' ).textContent = `${ this.formatNumber( this.iconData.totalIcons ) } icons`;
            this.byId( 'total-size' ).textContent = this.iconData.formattedTotalSize;

            this.byId( 'packs-grid' ).innerHTML = this.iconData?.packs.length
                ? this.iconData.packs.map( p => this.packCardHtml( p ) ).join( '' )
                : '<p>No icon packs found.</p>';

        }

    }

    showPackView ( packName ) {

        const pack = this.iconData.packs.find( p => p.name === packName );
        if ( ! pack ) return;

        this.currentPack = pack;
        this.currentView = 'pack';
        this.setView( 'icons' );
        this.clearInput();

        this.byId( 'pack-name' ).textContent = pack.name;
        this.byId( 'pack-icon-count' ).textContent = `${ this.formatNumber( pack.iconCount ) } icons`;
        this.byId( 'pack-size' ).textContent = pack.formattedSize;

        this.renderIcons( pack.icons );

    }

    renderIcons ( icons ) {

        this.byId( 'icons-grid' ).innerHTML = icons?.length
            ? icons.map( i => this.iconCardHtml( i, this.currentPack.path ) ).join( '' )
            : '<p>No icons found.</p>';

    }

    filterIcons ( query ) {

        if ( ! this.currentPack ) return;

        const q = query.toLowerCase();
        const filtered = this.currentPack.icons.filter( icon =>
            icon.id.toString().includes( q ) ||
            icon.description.toLowerCase().includes( q ) ||
            icon.filename.toLowerCase().includes( q )
        );

        this.renderIcons( filtered );

    }

    // Search

    handleSearch ( query ) {

        this.searchQuery = query.toLowerCase().trim();
        this.searchQuery ? this.showSearchResults() : this.showMainView();

    }

    showSearchResults () {

        this.currentView = 'search';
        this.setView( 'results' );

        const results = { packs: [], icons: [] };

        if ( ! this.iconData ) {
            this.renderSearchResults( results );
            return;
        }

        const { searchFilter, searchQuery } = this;

        if ( searchFilter === 'all' || searchFilter === 'pack' ) {

            results.packs = this.iconData.packs.filter( pack =>
                pack.name.toLowerCase().includes( searchQuery )
            );

        }

        if ( searchFilter === 'all' || searchFilter === 'icon' ) {

            this.iconData.packs.forEach( pack => {
                pack.icons
                    .filter( icon =>
                        icon.id.toString().includes( searchQuery ) ||
                        icon.description.toLowerCase().includes( searchQuery ) ||
                        icon.filename.toLowerCase().includes( searchQuery )
                    )
                    .forEach( icon => results.icons.push( {
                        ...icon,
                        packName: pack.name,
                        packPath: pack.path
                    } ) );
            } );

        }

        this.renderSearchResults( results );

    }

    renderSearchResults ( results ) {

        const totalResults = ( results.packs?.length || 0 ) + ( results.icons?.length || 0 );
        this.byId( 'search-results-count' ).textContent = `${ this.formatNumber( totalResults ) } result${ totalResults !== 1 ? 's' : '' }`;

        const sections = [];

        if ( results.packs?.length ) {

            sections.push( `<div class="search-result-section">` +
                `<div class="search-result-header"><h3>Packs (${ this.formatNumber( results.packs.length ) })</h3></div>` +
                `<div class="search-result-content">` +
                    `<div class="packs-grid">${ results.packs.map( p => this.packCardHtml( p ) ).join( '' ) }</div>` +
                `</div>` +
            `</div>` );

        }

        if ( results.icons?.length ) {

            sections.push( `<div class="search-result-section">` +
                `<div class="search-result-header"><h3>Icons (${ this.formatNumber(  results.icons.length ) })</h3></div>` +
                `<div class="search-result-content">` +
                    `<div class="icons-grid">${ results.icons.map( i => this.iconCardHtml( i, i.packPath, i.packName ) ).join( '' ) }</div>` +
                `</div>` +
            `</div>` );

        }

        this.byId( 'search-results' ).innerHTML = sections.length ? sections.join( '' ) : '<p>No results found.</p>';

    }

    setSearchFilter ( filter ) {

        this.searchFilter = filter;
        document.querySelectorAll( '.filter-btn' ).forEach( btn =>
            btn.classList.toggle( 'active', btn.dataset.filter === filter )
        );

        if ( this.searchQuery ) this.showSearchResults();

    }

    // Html injection

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
                `<img src="icons/${path}/${icon.filename}" alt="${icon.description}" loading="lazy" />` +
            `</div>` +
            `<div class="icon-name">${icon.description}</div>` +
            `<div class="icon-actions">` +
                `<button data-action="download-icon" data-filename="${icon.filename}" data-packpath="${path}">Download</button>` +
                `<button data-action="copy-svg" data-filename="${icon.filename}" data-packpath="${path}">Copy SVG</button>` +
                ( packName ? `<button class="pack-name" data-action="show-pack" data-pack="${packName}">${packName}</button>` : '' ) +
            `</div>` +
        `</div>`;

    }

}

document.addEventListener( 'DOMContentLoaded', () => {
    window.app = new IconLibrary();
} );
