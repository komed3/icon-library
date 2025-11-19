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

        [ 'packs', 'icons', 'results', 'error' ].forEach( v => {
            const el = this.byId( v );
            if ( el ) el.style.display = v === viewId ? 'block' : 'none';
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

    async loadIconData () {}

}

document.addEventListener( 'DOMContentLoaded', () => {
    window.app = new IconLibrary();
} );
