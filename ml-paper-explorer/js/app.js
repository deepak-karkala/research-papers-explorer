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

function renderAlbumsListPage() {
    console.log('Rendering Albums List Page...');
    const albums = dataService.getAlbums();

    let albumsListHTML = `
        <section class="list-page-section">
            <h2>All Albums</h2>
            ${albums.length > 0 ? `
                <div class="card-grid">
                    ${albums.map(album => createAlbumCardHTML(album)).join('')}
                </div>
            ` : '<p>No albums available at the moment.</p>'}
        </section>
    `;

    renderView(albumsListHTML, 'Albums List');
    updateNavActiveState('albums');
}

function renderPlaylistsListPage() {
    console.log('Rendering Playlists List Page...');
    const playlists = dataService.getPlaylists();

    let playlistsListHTML = `
        <section class="list-page-section">
            <h2>All Playlists</h2>
            ${playlists.length > 0 ? `
                <div class="card-grid">
                    ${playlists.map(playlist => createPlaylistCardHTML(playlist)).join('')}
                </div>
            ` : '<p>No playlists available at the moment.</p>'}
        </section>
    `;

    renderView(playlistsListHTML, 'Playlists List');
    updateNavActiveState('playlists');
}

function renderArtistsListPage() {
    console.log('Rendering Artists List Page...');
    const artists = dataService.getArtists();

    let artistsListHTML = `
        <section class="list-page-section">
            <h2>All Artists</h2>
            ${artists.length > 0 ? `
                <div class="card-grid artist-links"> {/* Using artist-links for consistency if it has specific styles */}
                    ${artists.map(artist => createArtistCardHTML(artist)).join('')}
                </div>
            ` : '<p>No artists available at the moment.</p>'}
        </section>
    `;

    renderView(artistsListHTML, 'Artists List');
    updateNavActiveState('artists');
}

function renderGenresListPage() {
    console.log('Rendering Genres List Page...');
    const genres = dataService.getGenres();

    let genresListHTML = `
        <section class="list-page-section">
            <h2>All Genres</h2>
            ${genres.length > 0 ? `
                <div class="card-grid genre-links"> {/* Using genre-links for consistency */}
                    ${genres.map(genre => createGenreCardHTML(genre)).join('')}
                </div>
            ` : '<p>No genres available at the moment.</p>'}
        </section>
    `;

    renderView(genresListHTML, 'Genres List');
    updateNavActiveState('genres');
}

function renderAlbumDetailPage(albumId) {
    console.log(`Rendering Album Detail Page for ID: ${albumId}`);
    const album = dataService.getAlbumById(albumId);

    if (!album) {
        renderView('<h2>Album Not Found</h2><p>Sorry, the requested album could not be found.</p>', 'Album Not Found');
        updateNavActiveState('albums'); // Keep 'Albums' active or clear active state
        return;
    }

    // Fetch papers for this album
    // Assuming getPapersForAlbum returns an array of paper objects
    const papersInAlbum = dataService.getPapersForAlbum(albumId); 

    let albumDetailHTML = `
        <section class="detail-page-section album-detail-page">
            <div class="detail-header">
                ${album.album_art_url ? `<img src="${album.album_art_url}" alt="${album.title}" class="detail-art">` : '<div class="detail-art-placeholder">No Album Art</div>'}
                <div class="detail-info">
                    <h1>${album.title}</h1>
                    ${album.description ? `<p class="detail-description">${album.description}</p>` : ''}
                    <p class="meta-info">Contains ${papersInAlbum.length} paper(s)</p>
                    <!-- You could list artist names here if dataService.getArtistById is used with album.artist_ids -->
                </div>
            </div>

            <div class="detail-content">
                <h3>Papers in this Album</h3>
                ${papersInAlbum.length > 0 ? `
                    <div class="card-grid paper-list">
                        ${papersInAlbum.map(paper => createPaperCardHTML(paper)).join('')}
                    </div>
                ` : '<p>No papers found in this album.</p>'}
            </div>
        </section>
    `;

    renderView(albumDetailHTML, `Album: ${album.title}`);
    updateNavActiveState('albums'); // Keep the main 'Albums' nav item active
}

function renderPlaylistDetailPage(playlistId) {
    console.log(`Rendering Playlist Detail Page for ID: ${playlistId}`);
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
                    <!-- Genre info could be added here if needed by fetching genre details -->
                </div>
            </div>

            <div class="detail-content">
                ${playlist.summary_article ? `
                    <article class="playlist-summary-article">
                        <h3>Summary</h3>
                        ${playlist.summary_article} {/* This content is expected to be safe HTML */}
                    </article>
                ` : ''}

                <h3>Papers in this Playlist</h3>
                ${papersInPlaylist.length > 0 ? `
                    <div class="card-grid paper-list">
                        ${papersInPlaylist.map(paper => createPaperCardHTML(paper)).join('')}
                    </div>
                ` : '<p>No papers found in this playlist.</p>'}
            </div>
        </section>
    `;

    renderView(playlistDetailHTML, `Playlist: ${playlist.title}`);
    updateNavActiveState('playlists'); 
}

function renderArtistDetailPage(artistId) {
    console.log(`Rendering Artist Detail Page for ID: ${artistId}`);
    const artist = dataService.getArtistById(artistId);

    if (!artist) {
        renderView('<h2>Artist Not Found</h2><p>Sorry, the requested artist could not be found.</p>', 'Artist Not Found');
        updateNavActiveState('artists');
        return;
    }

    const papersByArtist = dataService.getPapersByArtistId(artistId);
    const albumsByArtist = dataService.getAlbumsByArtistId(artistId); // Assuming this function exists and works

    let artistDetailHTML = `
        <section class="detail-page-section artist-detail-page">
            <div class="detail-header artist-header">
                ${artist.logo_url ? `<img src="${artist.logo_url}" alt="${artist.name}" class="detail-art artist-logo">` : '<div class="detail-art-placeholder artist-logo-placeholder">No Logo</div>'}
                <div class="detail-info">
                    <h1>${artist.name}</h1>
                    ${artist.description ? `<p class="detail-description artist-bio">${artist.description}</p>` : ''}
                    <p class="meta-info">Found ${papersByArtist.length} paper(s) and ${albumsByArtist.length} album(s) by this artist.</p>
                </div>
            </div>

            <div class="detail-content">
                ${papersByArtist.length > 0 ? `
                    <h3>Papers by ${artist.name}</h3>
                    <div class="card-grid paper-list">
                        ${papersByArtist.map(paper => createPaperCardHTML(paper)).join('')}
                    </div>
                ` : `<p>No papers found directly attributed to ${artist.name} in our records.</p>`}

                ${albumsByArtist.length > 0 ? `
                    <h3 class="mt-2">Albums by ${artist.name}</h3> {/* mt-2 for margin-top */}
                    <div class="card-grid album-list">
                        ${albumsByArtist.map(album => createAlbumCardHTML(album)).join('')}
                    </div>
                ` : `<p class="mt-1">No albums found directly attributed to ${artist.name} in our records.</p>`}
            </div>
        </section>
    `;

    renderView(artistDetailHTML, `Artist: ${artist.name}`);
    updateNavActiveState('artists'); 
}

function renderGenreDetailPage(genreId) {
    console.log(`Rendering Genre Detail Page for ID: ${genreId}`);
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
                {/* No standard art for genre, so header is simpler */}
                <div class="detail-info">
                    <h1>${genre.name}</h1>
                    ${genre.description ? `<p class="detail-description genre-description">${genre.description}</p>` : ''}
                    <p class="meta-info">Found ${playlistsInGenre.length} playlist(s) and ${papersInGenre.length} paper(s) in this genre.</p>
                </div>
            </div>

            <div class="detail-content">
                ${playlistsInGenre.length > 0 ? `
                    <h3>Playlists in ${genre.name}</h3>
                    <div class="card-grid playlist-list">
                        ${playlistsInGenre.map(playlist => createPlaylistCardHTML(playlist)).join('')}
                    </div>
                ` : `<p>No playlists found in ${genre.name}.</p>`}

                ${papersInGenre.length > 0 ? `
                    <h3 class="mt-2">Papers in ${genre.name}</h3> {/* mt-2 for margin-top */}
                    <div class="card-grid paper-list">
                        ${papersInGenre.map(paper => createPaperCardHTML(paper)).join('')}
                    </div>
                ` : `<p class="mt-1">No individual papers found directly in ${genre.name}. Check playlists for curated papers.</p>`}
            </div>
        </section>
    `;

    renderView(genreDetailHTML, `Genre: ${genre.name}`);
    updateNavActiveState('genres'); 
}

function renderSearchResultsPage(query) {
    console.log(`Rendering Search Results Page for query: "${query}"`);
    const searchResults = dataService.performSearch(query);

    let resultsHTML = `<section class="search-results-page">`;
    resultsHTML += `<h2>Search Results for: "${query ? query : '...'}"</h2>`;

    let totalResults = 0;

    // Papers
    if (searchResults.matchedPapers.length > 0) {
        totalResults += searchResults.matchedPapers.length;
        resultsHTML += `
            <div class="search-category-section">
                <h3>Papers (${searchResults.matchedPapers.length})</h3>
                <div class="card-grid paper-list">
                    ${searchResults.matchedPapers.map(paper => createPaperCardHTML(paper)).join('')}
                </div>
            </div>`;
    } else {
        resultsHTML += `<p class="no-results-category">No papers found matching your query.</p>`;
    }

    // Albums
    if (searchResults.matchedAlbums.length > 0) {
        totalResults += searchResults.matchedAlbums.length;
        resultsHTML += `
            <div class="search-category-section">
                <h3>Albums (${searchResults.matchedAlbums.length})</h3>
                <div class="card-grid album-list">
                    ${searchResults.matchedAlbums.map(album => createAlbumCardHTML(album)).join('')}
                </div>
            </div>`;
    } else {
        resultsHTML += `<p class="no-results-category">No albums found matching your query.</p>`;
    }

    // Playlists
    if (searchResults.matchedPlaylists.length > 0) {
        totalResults += searchResults.matchedPlaylists.length;
        resultsHTML += `
            <div class="search-category-section">
                <h3>Playlists (${searchResults.matchedPlaylists.length})</h3>
                <div class="card-grid playlist-list">
                    ${searchResults.matchedPlaylists.map(playlist => createPlaylistCardHTML(playlist)).join('')}
                </div>
            </div>`;
    } else {
        resultsHTML += `<p class="no-results-category">No playlists found matching your query.</p>`;
    }

    // Artists
    if (searchResults.matchedArtists.length > 0) {
        totalResults += searchResults.matchedArtists.length;
        resultsHTML += `
            <div class="search-category-section">
                <h3>Artists (${searchResults.matchedArtists.length})</h3>
                <div class="card-grid artist-links">
                    ${searchResults.matchedArtists.map(artist => createArtistCardHTML(artist)).join('')}
                </div>
            </div>`;
    } else {
        resultsHTML += `<p class="no-results-category">No artists found matching your query.</p>`;
    }

    // Genres
    if (searchResults.matchedGenres.length > 0) {
        totalResults += searchResults.matchedGenres.length;
        resultsHTML += `
            <div class="search-category-section">
                <h3>Genres (${searchResults.matchedGenres.length})</h3>
                <div class="card-grid genre-links">
                    ${searchResults.matchedGenres.map(genre => createGenreCardHTML(genre)).join('')}
                </div>
            </div>`;
    } else {
        resultsHTML += `<p class="no-results-category">No genres found matching your query.</p>`;
    }

    if (totalResults === 0 && query) { // Only show if query was not empty
        resultsHTML = `
            <section class="search-results-page">
                <h2>Search Results for: "${query}"</h2>
                <p class="no-results-overall">No results found for your query. Try different keywords.</p>
            </section>
        `;
    } else if (!query && totalResults === 0) { // Case where user navigates to #search/ directly
         resultsHTML = `
            <section class="search-results-page">
                <h2>Search</h2>
                <p>Please enter a search term in the bar above.</p>
            </section>
        `;
    }


    resultsHTML += `</section>`;

    renderView(resultsHTML, `Search: ${query}`);
    updateNavActiveState('search'); // A new state for when search results are shown
}

// --- Paper Detail Modal ---

function showPaperDetailModal(paperId) {
    const paper = dataService.getPaperById(paperId);
    if (!paper) {
        console.error(`Paper with ID ${paperId} not found for modal.`);
        // Optionally, show a small error message to the user
        alert('Error: Paper details could not be loaded.');
        return;
    }

    // Create modal structure
    const modalHTML = `
        <div id="paper-detail-modal" class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close-btn" onclick="closePaperDetailModal()">&times;</button>
                <h2>${paper.title}</h2>
                <p class="modal-meta"><strong>Authors:</strong> ${paper.authors ? paper.authors.join(', ') : 'N/A'}</p>
                <p class="modal-meta"><strong>Year:</strong> ${paper.year || 'N/A'} | <strong>Venue:</strong> ${paper.venue || 'N/A'}</p>
                
                ${paper.abstract ? `
                    <div class="modal-section">
                        <h3>Abstract</h3>
                        <p>${paper.abstract}</p>
                    </div>
                ` : ''}

                ${(paper.takeaways && paper.takeaways.length > 0) ? `
                    <div class="modal-section">
                        <h3>Key Takeaways</h3>
                        <ul>
                            ${paper.takeaways.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="modal-links">
                    ${paper.pdf_url ? `<a href="${paper.pdf_url}" target="_blank" class="btn btn-primary">View PDF</a>` : ''}
                    ${paper.code_url ? `<a href="${paper.code_url}" target="_blank" class="btn btn-secondary">View Code</a>` : ''}
                </div>
            </div>
        </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open'); // For disabling background scroll
}

function closePaperDetailModal() {
    const modal = document.getElementById('paper-detail-modal');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('modal-open'); // Re-enable background scroll
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

        // Event Listener for Paper Cards (using event delegation on app-root)
        // This is placed here to ensure appRoot is defined and data is loaded.
        const appRootElement = document.getElementById('app-root'); // Re-fetch or use appRoot directly
        if (appRootElement) {
            appRootElement.addEventListener('click', function(event) {
                // Traverse up the DOM to find if a paper card was clicked
                let targetCard = event.target.closest('.paper-card'); 
                if (targetCard) {
                    const paperId = targetCard.dataset.paperId;
                    if (paperId) {
                        showPaperDetailModal(paperId);
                    }
                }
            });
            console.log('Paper card click listener initialized on #app-root.');
        } else {
            console.error('Could not attach paper card click listener: #app-root not found at listener setup time.');
        }

        // Search Form Event Listener
        const searchForm = document.getElementById('search-form');
        const searchBar = document.getElementById('search-bar'); // Keep reference if needed directly

        if (searchForm && searchBar) {
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent default form submission
                const query = searchBar.value.trim();
                
                if (query) {
                    console.log(`Search form submitted with query: ${query}`);
                    window.location.hash = `search/${encodeURIComponent(query)}`;
                    // searchBar.value = ''; // Optionally clear the search bar
                } else {
                    console.log('Search form submitted with empty query.');
                    // Optionally, you could direct to a generic search page or show a message
                    // For now, if query is empty, we do nothing to the hash.
                    // Or, redirect to home if desired:
                    // window.location.hash = 'home';
                }
            });
            console.log('Search form event listener initialized.');
        } else {
            console.warn('Search form element (#search-form) or search bar (#search-bar) not found.');
        }

    } else {
        renderView('<p style="color: red; text-align: center;">Error: Could not load application data. Please try again later.</p>', 'Data Load Error');
        console.error('Failed to load data. Application cannot start.');
    }
});
