// Main application logic for ML Paper Explorer

// Reference to the main content area
const appRoot = document.getElementById('app-root');

// --- UI Component Card Renderers ---

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

function createAlbumCardHTML(album) {
    if (!album) return '<div class="card error-card">Error: Album data missing.</div>';
    // Get paper count for the album
    const paperCount = album.paper_ids ? album.paper_ids.length : 0;
    return `
        <div class="card album-card" data-album-id="${album.id}">
            ${album.album_art_url ? `<img src="${album.album_art_url}" alt="${album.title}" class="card-thumbnail">` : '<div class="card-thumbnail-placeholder">No Art</div>'}
            <h3 class="card-title">${album.title || 'Untitled Album'}</h3>
            <p class="card-meta">${paperCount} paper(s)</p>
        </div>
    `;
}

function createPlaylistCardHTML(playlist) {
    if (!playlist) return '<div class="card error-card">Error: Playlist data missing.</div>';
    // Get paper count for the playlist
    const paperCount = playlist.paper_ids ? playlist.paper_ids.length : 0;
    return `
        <div class="card playlist-card" data-playlist-id="${playlist.id}">
            ${playlist.playlist_art_url ? `<img src="${playlist.playlist_art_url}" alt="${playlist.title}" class="card-thumbnail">` : '<div class="card-thumbnail-placeholder">No Art</div>'}
            <h3 class="card-title">${playlist.title || 'Untitled Playlist'}</h3>
            <p class="card-meta">${paperCount} paper(s)</p>
        </div>
    `;
}

function createArtistCardHTML(artist) {
    if (!artist) return '<div class="card error-card">Error: Artist data missing.</div>';
    return `
        <a href="#artist/${artist.id}" class="card artist-card artist-link" data-artist-id="${artist.id}">
            ${artist.logo_url ? `<img src="${artist.logo_url}" alt="${artist.name}" class="card-logo">` : ''}
            <h4 class="card-title-link">${artist.name || 'Unknown Artist'}</h4>
        </a>
    `;
}

function createGenreCardHTML(genre) {
    if (!genre) return '<div class="card error-card">Error: Genre data missing.</div>';
    return `
        <a href="#genre/${genre.id}" class="card genre-card genre-link" data-genre-id="${genre.id}">
            <h4 class="card-title-link">${genre.name || 'Unknown Genre'}</h4>
        </a>
    `;
}

// --- Page Renderers ---

function renderHomePage() {
    console.log('Rendering Home Page...');

    // Fetch some data - for now, let's take a slice or all of it.
    // In a real app, "featured" might be determined by specific flags in the data or other logic.
    const featuredAlbums = dataService.getAlbums().slice(0, 5); // Get first 5 albums
    const featuredPlaylists = dataService.getPlaylists().slice(0, 5); // Get first 5 playlists
    const browseGenres = dataService.getGenres().slice(0, 10); // Get first 10 genres
    const browseArtists = dataService.getArtists().slice(0, 10); // Get first 10 artists

    let homeHTML = `
        <section class="home-section">
            <h2>Featured Albums</h2>
            ${featuredAlbums.length > 0 ? `
                <div class="card-row">
                    ${featuredAlbums.map(album => createAlbumCardHTML(album)).join('')}
                </div>
            ` : '<p>No featured albums available.</p>'}
        </section>

        <section class="home-section">
            <h2>Featured Playlists</h2>
            ${featuredPlaylists.length > 0 ? `
                <div class="card-row">
                    ${featuredPlaylists.map(playlist => createPlaylistCardHTML(playlist)).join('')}
                </div>
            ` : '<p>No featured playlists available.</p>'}
        </section>

        <section class="home-section">
            <h2>Browse by Genre</h2>
            ${browseGenres.length > 0 ? `
                <div class="card-grid genre-links"> 
                    ${browseGenres.map(genre => createGenreCardHTML(genre)).join('')}
                </div>
            ` : '<p>No genres available.</p>'}
        </section>
        
        <section class="home-section">
            <h2>Browse by Artist</h2>
            ${browseArtists.length > 0 ? `
                <div class="card-grid artist-links">
                    ${browseArtists.map(artist => createArtistCardHTML(artist)).join('')}
                </div>
            ` : '<p>No artists available.</p>'}
        </section>
    `;

    renderView(homeHTML, 'Home');

    // Ensure navigation links in header are correct (already set in index.html)
    // Example: <a href="#home">Home</a>, <a href="#albums">Albums</a>
    // We might want to add an "active" class to the current page link here if not handled by CSS :target or similar
    updateNavActiveState('home'); 
}

// Helper function to update active state in navigation (optional, but good for UX)
function updateNavActiveState(currentPagePath) {
    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        // Check href against current page path. Assumes hrefs are like "/#home", "/#albums"
        if (link.getAttribute('href') === `/#${currentPagePath}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// --- Basic View Renderer Function ---
function renderView(htmlContent, viewName = 'Unknown') {
    if (!appRoot) {
        console.error(`Cannot render view "${viewName}", app-root element not found.`);
        return;
    }
    // Clear previous content
    appRoot.innerHTML = ''; 
    // Set new content
    appRoot.innerHTML = htmlContent;
    console.log(`View "${viewName}" rendered.`);
}

// --- Client-Side Router ---
function handleRouteChange() {
    const hash = window.location.hash || '#home'; // Default to #home if no hash
    const [path, param] = hash.substring(1).split('/'); // Remove # and split path/param

    console.log(`Routing to: Path=${path}, Param=${param}`);
    
    // Call updateNavActiveState for all routes, not just home
    updateNavActiveState(path.split('/')[0]); // Pass the base path (e.g., 'album' from 'album/album001')

    // The renderView function will now be used by the case statements
    switch (path) {
        case 'home':
            if (typeof renderHomePage === 'function') {
                renderHomePage(); // This function will call renderView itself
            } else {
                renderView('<h1>Home Page</h1><p>Content coming soon!</p>', 'Home');
            }
            break;
        case 'albums':
            if (typeof renderAlbumsListPage === 'function') {
                renderAlbumsListPage(); // This function will call renderView itself
            } else {
                renderView('<h1>All Albums</h1><p>Content coming soon!</p>', 'Albums List');
            }
            break;
        case 'album':
            if (typeof renderAlbumDetailPage === 'function') {
                renderAlbumDetailPage(param); // This function will call renderView itself
            } else {
                renderView(`<h1>Album Detail: ${param}</h1><p>Content coming soon!</p>`, `Album Detail: ${param}`);
            }
            break;
        case 'playlists':
            if (typeof renderPlaylistsListPage === 'function') {
                renderPlaylistsListPage(); // This function will call renderView itself
            } else {
                renderView('<h1>All Playlists</h1><p>Content coming soon!</p>', 'Playlists List');
            }
            break;
        case 'playlist':
            if (typeof renderPlaylistDetailPage === 'function') {
                renderPlaylistDetailPage(param); // This function will call renderView itself
            } else {
                renderView(`<h1>Playlist Detail: ${param}</h1><p>Content coming soon!</p>`, `Playlist Detail: ${param}`);
            }
            break;
        case 'artists':
            if (typeof renderArtistsListPage === 'function') {
                renderArtistsListPage(); // This function will call renderView itself
            } else {
                renderView('<h1>All Artists</h1><p>Content coming soon!</p>', 'Artists List');
            }
            break;
        case 'artist':
            if (typeof renderArtistDetailPage === 'function') {
                renderArtistDetailPage(param); // This function will call renderView itself
            } else {
                renderView(`<h1>Artist Detail: ${param}</h1><p>Content coming soon!</p>`, `Artist Detail: ${param}`);
            }
            break;
        case 'genres':
            if (typeof renderGenresListPage === 'function') {
                renderGenresListPage(); // This function will call renderView itself
            } else {
                renderView('<h1>All Genres</h1><p>Content coming soon!</p>', 'Genres List');
            }
            break;
        case 'genre':
            if (typeof renderGenreDetailPage === 'function') {
                renderGenreDetailPage(param); // This function will call renderView itself
            } else {
                renderView(`<h1>Genre Detail: ${param}</h1><p>Content coming soon!</p>`, `Genre Detail: ${param}`);
            }
            break;
        case 'search':
            const query = decodeURIComponent(param || '');
            if (typeof renderSearchResultsPage === 'function') {
                renderSearchResultsPage(query); // This function will call renderView itself
            } else {
                renderView(`<h1>Search Results for: ${query}</h1><p>Content coming soon!</p>`, `Search: ${query}`);
            }
            break;
        default:
            renderView('<h1>404 - Page Not Found</h1><p>The requested page does not exist.</p>', '404 Not Found');
            console.warn(`Unknown route: ${path}`);
            break;
    }
}

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    if (!appRoot) {
        console.error('CRITICAL: app-root element not found in the DOM. App cannot start.');
        document.body.innerHTML = '<p style="color: red; text-align: center; font-size: 2em;">Critical Error: Application root not found.</p>';
        return;
    }

    const dataLoadedSuccessfully = await dataService.loadAllData();

    if (dataLoadedSuccessfully) {
        console.log('Data service loaded all data.');
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange(); 
        console.log('Router initialized and initial route processed.');
    } else {
        renderView('<p style="color: red; text-align: center;">Error: Could not load application data. Please try again later.</p>', 'Data Load Error');
        console.error('Failed to load data. Application cannot start.');
    }
});
