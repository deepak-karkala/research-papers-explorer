/**
 * @file app.js
 * @description Main application logic for the ML Paper Explorer.
 * Handles routing, rendering views, UI component creation, and event handling.
 */

// Reference to the main content area in index.html
const appRoot = document.getElementById('app-root');

// --- UI Component Card Renderers ---

/**
 * Creates HTML string for a paper card.
 * @param {Object} paper - The paper object.
 * @returns {string} HTML string for the paper card.
 */
function createPaperCardHTML(paper) {
    if (!paper) return '<div class="card error-card">Error: Paper data missing.</div>';
    return `
        <div class="card paper-card" data-paper-id="${paper.id}">
            ${paper.thumbnail_image_url ? `<img src="${paper.thumbnail_image_url}" alt="${paper.title}" class="card-thumbnail">` : '<div class="card-thumbnail-placeholder">No Image</div>'}
            <h3 class="card-title">${paper.title || 'Untitled Paper'}</h3>
            <p class="card-authors">${(paper.authors && paper.authors.length > 0) ? paper.authors.join(', ') : 'Unknown Authors'}</p>
            <p class="card-meta">${paper.year || 'Unknown Year'}</p>
        </div>
    `;
}

/**
 * Creates HTML string for an album card.
 * @param {Object} album - The album object.
 * @returns {string} HTML string for the album card.
 */
function createAlbumCardHTML(album) {
    if (!album) return '<div class="card error-card">Error: Album data missing.</div>';
    const paperCount = album.paper_ids ? album.paper_ids.length : 0;
    return `
        <a href="#album/${album.id}" class="card album-card" data-album-id="${album.id}">
            ${album.album_art_url ? `<img src="${album.album_art_url}" alt="${album.title}" class="card-thumbnail">` : '<div class="card-thumbnail-placeholder">No Art</div>'}
            <h3 class="card-title">${album.title || 'Untitled Album'}</h3>
            <p class="card-meta">${paperCount} paper(s)</p>
        </a>
    `;
}

/**
 * Creates HTML string for a playlist card.
 * @param {Object} playlist - The playlist object.
 * @returns {string} HTML string for the playlist card.
 */
function createPlaylistCardHTML(playlist) {
    if (!playlist) return '<div class="card error-card">Error: Playlist data missing.</div>';
    const paperCount = playlist.paper_ids ? playlist.paper_ids.length : 0;
    return `
        <a href="#playlist/${playlist.id}" class="card playlist-card" data-playlist-id="${playlist.id}">
            ${playlist.playlist_art_url ? `<img src="${playlist.playlist_art_url}" alt="${playlist.title}" class="card-thumbnail">` : '<div class="card-thumbnail-placeholder">No Art</div>'}
            <h3 class="card-title">${playlist.title || 'Untitled Playlist'}</h3>
            <p class="card-meta">${paperCount} paper(s)</p>
        </a>
    `;
}

/**
 * Creates HTML string for an artist card link.
 * @param {Object} artist - The artist object.
 * @returns {string} HTML string for the artist card.
 */
function createArtistCardHTML(artist) {
    if (!artist) return '<div class="card error-card">Error: Artist data missing.</div>';
    return `
        <a href="#artist/${artist.id}" class="card artist-card artist-link" data-artist-id="${artist.id}">
            ${artist.logo_url ? `<img src="${artist.logo_url}" alt="${artist.name}" class="card-logo">` : `<div class="card-logo card-thumbnail-placeholder">${artist.name ? artist.name.substring(0,1) : '?'}</div>`}
            <h4 class="card-title-link">${artist.name || 'Unknown Artist'}</h4>
        </a>
    `;
}

/**
 * Creates HTML string for a genre card link.
 * @param {Object} genre - The genre object.
 * @returns {string} HTML string for the genre card.
 */
function createGenreCardHTML(genre) {
    if (!genre) return '<div class="card error-card">Error: Genre data missing.</div>';
    return `
        <a href="#genre/${genre.id}" class="card genre-card genre-link" data-genre-id="${genre.id}">
            <h4 class="card-title-link">${genre.name || 'Unknown Genre'}</h4>
        </a>
    `;
}

// --- Page Renderers ---

/**
 * Renders the Home Page with featured content.
 * Calls `renderView` to update the DOM and `updateNavActiveState`.
 */
function renderHomePage() {
    const featuredAlbums = dataService.getAlbums().slice(0, 5);
    const featuredPlaylists = dataService.getPlaylists().slice(0, 5);
    const browseGenres = dataService.getGenres().slice(0, 10);
    const browseArtists = dataService.getArtists().slice(0, 10);

    let homeHTML = `
        <section class="home-section">
            <h2>Featured Albums</h2>
            ${featuredAlbums.length > 0 ? `<div class="card-row">${featuredAlbums.map(album => createAlbumCardHTML(album)).join('')}</div>` : '<p>No featured albums available.</p>'}
        </section>
        <section class="home-section">
            <h2>Featured Playlists</h2>
            ${featuredPlaylists.length > 0 ? `<div class="card-row">${featuredPlaylists.map(playlist => createPlaylistCardHTML(playlist)).join('')}</div>` : '<p>No featured playlists available.</p>'}
        </section>
        <section class="home-section">
            <h2>Browse by Genre</h2>
            ${browseGenres.length > 0 ? `<div class="card-grid genre-links">${browseGenres.map(genre => createGenreCardHTML(genre)).join('')}</div>` : '<p>No genres available.</p>'}
        </section>
        <section class="home-section">
            <h2>Browse by Artist</h2>
            ${browseArtists.length > 0 ? `<div class="card-grid artist-links">${browseArtists.map(artist => createArtistCardHTML(artist)).join('')}</div>` : '<p>No artists available.</p>'}
        </section>
    `;
    renderView(homeHTML, 'Home');
    updateNavActiveState('home'); 
}

/**
 * Updates the 'active' class on navigation links based on the current page.
 * @param {string} currentPagePath - The base path of the current page (e.g., 'home', 'albums').
 */
function updateNavActiveState(currentPagePath) {
    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        // HREF is expected to be like '/#path' or '/#path/param'
        const linkPath = link.getAttribute('href').substring(2); // Remove '/#'
        if (linkPath.startsWith(currentPagePath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/** Renders the list page for all albums. */
function renderAlbumsListPage() {
    const albums = dataService.getAlbums();
    let albumsListHTML = `
        <section class="list-page-section">
            <h2>All Albums</h2>
            ${albums.length > 0 ? `<div class="card-grid">${albums.map(album => createAlbumCardHTML(album)).join('')}</div>` : '<p>No albums available at the moment.</p>'}
        </section>
    `;
    renderView(albumsListHTML, 'Albums List');
    updateNavActiveState('albums');
}

/** Renders the list page for all playlists. */
function renderPlaylistsListPage() {
    const playlists = dataService.getPlaylists();
    let playlistsListHTML = `
        <section class="list-page-section">
            <h2>All Playlists</h2>
            ${playlists.length > 0 ? `<div class="card-grid">${playlists.map(playlist => createPlaylistCardHTML(playlist)).join('')}</div>` : '<p>No playlists available at the moment.</p>'}
        </section>
    `;
    renderView(playlistsListHTML, 'Playlists List');
    updateNavActiveState('playlists');
}

/** Renders the list page for all artists. */
function renderArtistsListPage() {
    const artists = dataService.getArtists();
    let artistsListHTML = `
        <section class="list-page-section">
            <h2>All Artists</h2>
            ${artists.length > 0 ? `<div class="card-grid artist-links">${artists.map(artist => createArtistCardHTML(artist)).join('')}</div>` : '<p>No artists available at the moment.</p>'}
        </section>
    `;
    renderView(artistsListHTML, 'Artists List');
    updateNavActiveState('artists');
}

/** Renders the list page for all genres. */
function renderGenresListPage() {
    const genres = dataService.getGenres();
    let genresListHTML = `
        <section class="list-page-section">
            <h2>All Genres</h2>
            ${genres.length > 0 ? `<div class="card-grid genre-links">${genres.map(genre => createGenreCardHTML(genre)).join('')}</div>` : '<p>No genres available at the moment.</p>'}
        </section>
    `;
    renderView(genresListHTML, 'Genres List');
    updateNavActiveState('genres');
}

/**
 * Renders the detail page for a specific album.
 * @param {string} albumId - The ID of the album to display.
 */
function renderAlbumDetailPage(albumId) {
    const album = dataService.getAlbumById(albumId);
    if (!album) {
        renderView('<h2>Album Not Found</h2><p>Sorry, the requested album could not be found.</p>', 'Album Not Found');
        updateNavActiveState('albums'); 
        return;
    }
    const papersInAlbum = dataService.getPapersForAlbum(albumId); 
    let albumDetailHTML = `
        <section class="detail-page-section album-detail-page">
            <div class="detail-header">
                ${album.album_art_url ? `<img src="${album.album_art_url}" alt="${album.title}" class="detail-art">` : '<div class="detail-art-placeholder">No Album Art</div>'}
                <div class="detail-info">
                    <h1>${album.title}</h1>
                    ${album.description ? `<p class="detail-description">${album.description}</p>` : ''}
                    <p class="meta-info">Contains ${papersInAlbum.length} paper(s)</p>
                </div>
            </div>
            <div class="detail-content">
                <h3>Papers in this Album</h3>
                ${papersInAlbum.length > 0 ? `<div class="card-grid paper-list">${papersInAlbum.map(paper => createPaperCardHTML(paper)).join('')}</div>` : '<p>No papers found in this album.</p>'}
            </div>
        </section>
    `;
    renderView(albumDetailHTML, `Album: ${album.title}`);
    updateNavActiveState('albums'); 
}

/**
 * Renders the detail page for a specific playlist.
 * @param {string} playlistId - The ID of the playlist to display.
 */
function renderPlaylistDetailPage(playlistId) {
    const playlist = dataService.getPlaylistById(playlistId);
    if (!playlist) {
        renderView('<h2>Playlist Not Found</h2><p>Sorry, the requested playlist could not be found.</p>', 'Playlist Not Found');
        updateNavActiveState('playlists');
        return;
    }
    const papersInPlaylist = dataService.getPapersForPlaylist(playlistId);
    let playlistDetailHTML = `
        <section class="detail-page-section playlist-detail-page">
            <div class="detail-header">
                ${playlist.playlist_art_url ? `<img src="${playlist.playlist_art_url}" alt="${playlist.title}" class="detail-art">` : '<div class="detail-art-placeholder">No Playlist Art</div>'}
                <div class="detail-info">
                    <h1>${playlist.title}</h1>
                    <p class="meta-info">Contains ${papersInPlaylist.length} paper(s)</p>
                </div>
            </div>
            <div class="detail-content">
                ${playlist.summary_article ? `<article class="playlist-summary-article"><h3>Summary</h3>${playlist.summary_article}</article>` : ''}
                <h3>Papers in this Playlist</h3>
                ${papersInPlaylist.length > 0 ? `<div class="card-grid paper-list">${papersInPlaylist.map(paper => createPaperCardHTML(paper)).join('')}</div>` : '<p>No papers found in this playlist.</p>'}
            </div>
        </section>
    `;
    renderView(playlistDetailHTML, `Playlist: ${playlist.title}`);
    updateNavActiveState('playlists'); 
}

/**
 * Renders the detail page for a specific artist.
 * @param {string} artistId - The ID of the artist to display.
 */
function renderArtistDetailPage(artistId) {
    const artist = dataService.getArtistById(artistId);
    if (!artist) {
        renderView('<h2>Artist Not Found</h2><p>Sorry, the requested artist could not be found.</p>', 'Artist Not Found');
        updateNavActiveState('artists');
        return;
    }
    const papersByArtist = dataService.getPapersByArtistId(artistId);
    const albumsByArtist = dataService.getAlbumsByArtistId(artistId);
    let artistDetailHTML = `
        <section class="detail-page-section artist-detail-page">
            <div class="detail-header artist-header">
                ${artist.logo_url ? `<img src="${artist.logo_url}" alt="${artist.name}" class="detail-art artist-logo">` : `<div class="detail-art-placeholder artist-logo-placeholder">${artist.name ? artist.name.substring(0,1) : '?'}</div>`}
                <div class="detail-info">
                    <h1>${artist.name}</h1>
                    ${artist.description ? `<p class="detail-description artist-bio">${artist.description}</p>` : ''}
                    <p class="meta-info">Found ${papersByArtist.length} paper(s) and ${albumsByArtist.length} album(s) by this artist.</p>
                </div>
            </div>
            <div class="detail-content">
                ${papersByArtist.length > 0 ? `<h3>Papers by ${artist.name}</h3><div class="card-grid paper-list">${papersByArtist.map(paper => createPaperCardHTML(paper)).join('')}</div>` : `<p>No papers found directly attributed to ${artist.name}.</p>`}
                ${albumsByArtist.length > 0 ? `<h3 class="mt-2">Albums by ${artist.name}</h3><div class="card-grid album-list">${albumsByArtist.map(album => createAlbumCardHTML(album)).join('')}</div>` : `<p class="mt-1">No albums found directly attributed to ${artist.name}.</p>`}
            </div>
        </section>
    `;
    renderView(artistDetailHTML, `Artist: ${artist.name}`);
    updateNavActiveState('artists'); 
}

/**
 * Renders the detail page for a specific genre.
 * @param {string} genreId - The ID of the genre to display.
 */
function renderGenreDetailPage(genreId) {
    const genre = dataService.getGenreById(genreId);
    if (!genre) {
        renderView('<h2>Genre Not Found</h2><p>Sorry, the requested genre could not be found.</p>', 'Genre Not Found');
        updateNavActiveState('genres');
        return;
    }
    const playlistsInGenre = dataService.getPlaylistsByGenreId(genreId);
    const papersInGenre = dataService.getPapersByGenreId(genreId);
    let genreDetailHTML = `
        <section class="detail-page-section genre-detail-page">
            <div class="detail-header genre-header">
                <div class="detail-info">
                    <h1>${genre.name}</h1>
                    ${genre.description ? `<p class="detail-description genre-description">${genre.description}</p>` : ''}
                    <p class="meta-info">Found ${playlistsInGenre.length} playlist(s) and ${papersInGenre.length} paper(s) in this genre.</p>
                </div>
            </div>
            <div class="detail-content">
                ${playlistsInGenre.length > 0 ? `<h3>Playlists in ${genre.name}</h3><div class="card-grid playlist-list">${playlistsInGenre.map(playlist => createPlaylistCardHTML(playlist)).join('')}</div>` : `<p>No playlists found in ${genre.name}.</p>`}
                ${papersInGenre.length > 0 ? `<h3 class="mt-2">Papers in ${genre.name}</h3><div class="card-grid paper-list">${papersInGenre.map(paper => createPaperCardHTML(paper)).join('')}</div>` : `<p class="mt-1">No individual papers found directly in ${genre.name}. Check playlists for curated papers.</p>`}
            </div>
        </section>
    `;
    renderView(genreDetailHTML, `Genre: ${genre.name}`);
    updateNavActiveState('genres'); 
}

/**
 * Renders the search results page for a given query.
 * @param {string} query - The search query.
 */
function renderSearchResultsPage(query) {
    const searchResults = dataService.performSearch(query);
    let resultsHTML = `<section class="search-results-page">`;
    resultsHTML += `<h2>Search Results for: "${query ? query : '...'}"</h2>`;
    let totalResults = 0;

    const categories = [
        { title: 'Papers', items: searchResults.matchedPapers, renderer: createPaperCardHTML, listClass: 'paper-list' },
        { title: 'Albums', items: searchResults.matchedAlbums, renderer: createAlbumCardHTML, listClass: 'album-list' },
        { title: 'Playlists', items: searchResults.matchedPlaylists, renderer: createPlaylistCardHTML, listClass: 'playlist-list' },
        { title: 'Artists', items: searchResults.matchedArtists, renderer: createArtistCardHTML, listClass: 'artist-links' },
        { title: 'Genres', items: searchResults.matchedGenres, renderer: createGenreCardHTML, listClass: 'genre-links' }
    ];

    categories.forEach(category => {
        if (category.items.length > 0) {
            totalResults += category.items.length;
            resultsHTML += `
                <div class="search-category-section">
                    <h3>${category.title} (${category.items.length})</h3>
                    <div class="card-grid ${category.listClass}">
                        ${category.items.map(item => category.renderer(item)).join('')}
                    </div>
                </div>`;
        } else {
            // resultsHTML += `<p class="no-results-category">No ${category.title.toLowerCase()} found matching your query.</p>`;
        }
    });
    
    if (totalResults === 0 && query) {
        resultsHTML = `
            <section class="search-results-page">
                <h2>Search Results for: "${query}"</h2>
                <p class="no-results-overall">No results found for your query. Try different keywords.</p>
            </section>
        `;
    } else if (!query && totalResults === 0) {
         resultsHTML = `
            <section class="search-results-page">
                <h2>Search</h2>
                <p>Please enter a search term in the bar above.</p>
            </section>
        `;
    }
    resultsHTML += `</section>`;
    renderView(resultsHTML, `Search: ${query}`);
    updateNavActiveState('search'); 
}

// --- Paper Detail Modal ---

/**
 * Displays a modal with details for a specific paper.
 * @param {string} paperId - The ID of the paper to display in the modal.
 */
function showPaperDetailModal(paperId) {
    const paper = dataService.getPaperById(paperId);
    if (!paper) {
        console.error(`Paper with ID ${paperId} not found for modal.`);
        alert('Error: Paper details could not be loaded.'); // Simple user feedback
        return;
    }
    const modalHTML = `
        <div id="paper-detail-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title-${paper.id}">
            <div class="modal-content">
                <button class="modal-close-btn" onclick="closePaperDetailModal()" aria-label="Close paper details">&times;</button>
                <h2 id="modal-title-${paper.id}">${paper.title}</h2>
                <p class="modal-meta"><strong>Authors:</strong> ${paper.authors ? paper.authors.join(', ') : 'N/A'}</p>
                <p class="modal-meta"><strong>Year:</strong> ${paper.year || 'N/A'} | <strong>Venue:</strong> ${paper.venue || 'N/A'}</p>
                ${paper.abstract ? `<div class="modal-section"><h3>Abstract</h3><p>${paper.abstract}</p></div>` : ''}
                ${(paper.takeaways && paper.takeaways.length > 0) ? `<div class="modal-section"><h3>Key Takeaways</h3><ul>${paper.takeaways.map(item => `<li>${item}</li>`).join('')}</ul></div>` : ''}
                <div class="modal-links">
                    ${paper.pdf_url ? `<a href="${paper.pdf_url}" target="_blank" class="btn btn-primary">View PDF</a>` : ''}
                    ${paper.code_url ? `<a href="${paper.code_url}" target="_blank" class="btn btn-secondary">View Code</a>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open'); 
}

/** Closes the paper detail modal. */
function closePaperDetailModal() {
    const modal = document.getElementById('paper-detail-modal');
    if (modal) modal.remove();
    document.body.classList.remove('modal-open');
}

// --- Basic View Renderer Function ---

/**
 * Renders the provided HTML content into the main application root element.
 * @param {string} htmlContent - The HTML string to render.
 * @param {string} [viewName='Unknown'] - A name for the view, used for logging.
 */
function renderView(htmlContent, viewName = 'Unknown') {
    if (!appRoot) {
        console.error(`Cannot render view "${viewName}", app-root element not found.`);
        return;
    }
    appRoot.innerHTML = htmlContent; // Clear previous content and set new content
    // console.log(`View "${viewName}" rendered.`); // Removed verbose log
}

// --- Client-Side Router ---

/**
 * Handles changes in the URL hash to navigate between views.
 * Parses the hash, determines the route, and calls the appropriate rendering function.
 */
function handleRouteChange() {
    const hash = window.location.hash || '#home'; 
    const [path, param] = hash.substring(1).split('/'); 

    // console.log(`Routing to: Path=${path}, Param=${param}`); // Removed verbose log
    updateNavActiveState(path); // Pass the base path (e.g., 'album' from 'album/album001')

    switch (path) {
        case 'home': renderHomePage(); break;
        case 'albums': renderAlbumsListPage(); break;
        case 'album': renderAlbumDetailPage(param); break;
        case 'playlists': renderPlaylistsListPage(); break;
        case 'playlist': renderPlaylistDetailPage(param); break;
        case 'artists': renderArtistsListPage(); break;
        case 'artist': renderArtistDetailPage(param); break;
        case 'genres': renderGenresListPage(); break;
        case 'genre': renderGenreDetailPage(param); break;
        case 'search': renderSearchResultsPage(decodeURIComponent(param || '')); break;
        default:
            renderView('<h1>404 - Page Not Found</h1><p>The requested page does not exist.</p>', '404 Not Found');
            console.warn(`Unknown route: ${path}`);
            break;
    }
}

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // console.log('DOM fully loaded and parsed'); // Removed verbose log

    if (!appRoot) {
        console.error('CRITICAL: app-root element not found in the DOM. App cannot start.');
        document.body.innerHTML = '<p style="color: red; text-align: center; font-size: 2em;">Critical Error: Application root not found.</p>';
        return;
    }

    const dataLoadedSuccessfully = await dataService.loadAllData();

    if (dataLoadedSuccessfully) {
        // console.log('Data service loaded all data.'); // Covered by dataService log
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange(); // Initial route handling
        // console.log('Router initialized and initial route processed.'); // Removed verbose log

        // Event Listener for Paper Cards (using event delegation on app-root)
        appRoot.addEventListener('click', function(event) {
            const targetCard = event.target.closest('.paper-card'); 
            if (targetCard && targetCard.dataset.paperId) {
                showPaperDetailModal(targetCard.dataset.paperId);
            }
        });
        // console.log('Paper card click listener initialized on #app-root.'); // Removed verbose log

        // Search Form Event Listener
        const searchForm = document.getElementById('search-form');
        const searchBar = document.getElementById('search-bar');
        if (searchForm && searchBar) {
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault(); 
                const query = searchBar.value.trim();
                if (query) {
                    window.location.hash = `search/${encodeURIComponent(query)}`;
                }
            });
            // console.log('Search form event listener initialized.'); // Removed verbose log
        } else {
            console.warn('Search form or search bar element not found for event listener setup.');
        }
    } else {
        renderView('<p style="color: red; text-align: center;">Error: Could not load application data. Please try again later.</p>', 'Data Load Error');
        // console.error('Failed to load data. Application cannot start.'); // Covered by dataService log
    }
});
