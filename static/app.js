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

    escapeHtml ( text ) {

        const div = document.createElement( 'div' );
        div.textContent = text;

        return div.innerHTML;

    }

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

        this.renderPacks();
        this.updateStats();

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

}

document.addEventListener( 'DOMContentLoaded', () => {
    window.app = new IconLibrary();
} );
