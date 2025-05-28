/**
 * @file dataService.js
 * @description Service module for fetching and managing application data (papers, albums, etc.).
 */

const dataService = {
    papers: [],
    albums: [],
    playlists: [],
    artists: [],
    genres: [],

    /**
     * Fetches all data from JSON files and populates the service's data arrays.
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if all data is loaded successfully, false otherwise.
     */
    async loadAllData() {
        try {
            // Parallel fetching of all data JSON files.
            const [papersResponse, albumsResponse, playlistsResponse, artistsResponse, genresResponse] = await Promise.all([
                fetch('data/papers.json'),
                fetch('data/albums.json'),
                fetch('data/playlists.json'),
                fetch('data/artists.json'),
                fetch('data/genres.json')
            ]);

            // Check if all responses are ok.
            if (!papersResponse.ok || !albumsResponse.ok || !playlistsResponse.ok || !artistsResponse.ok || !genresResponse.ok) {
                throw new Error('Failed to load one or more data files.');
            }

            // Parse JSON from responses.
            this.papers = await papersResponse.json();
            this.albums = await albumsResponse.json();
            this.playlists = await playlistsResponse.json();
            this.artists = await artistsResponse.json();
            this.genres = await genresResponse.json();

            console.log('Data loaded successfully:', {
                papers: this.papers.length,
                albums: this.albums.length,
                playlists: this.playlists.length,
                artists: this.artists.length,
                genres: this.genres.length
            });
            return true; // Indicate success
        } catch (error) {
            console.error('Error loading data:', error);
            // In a real app, display this error to the user or have a more robust error handling mechanism.
            return false; // Indicate failure
        }
    },

    // --- General Getters ---

    /** @returns {Array<Object>} All paper objects. */
    getPapers: function() { return this.papers; },
    /** @returns {Array<Object>} All album objects. */
    getAlbums: function() { return this.albums; },
    /** @returns {Array<Object>} All playlist objects. */
    getPlaylists: function() { return this.playlists; },
    /** @returns {Array<Object>} All artist objects. */
    getArtists: function() { return this.artists; },
    /** @returns {Array<Object>} All genre objects. */
    getGenres: function() { return this.genres; },

    // --- Getters by ID ---

    /**
     * Finds a paper by its ID.
     * @param {string} id - The ID of the paper to find.
     * @returns {Object|undefined} The paper object if found, otherwise undefined.
     */
    getPaperById: function(id) {
        return this.papers.find(paper => paper.id === id);
    },
    /**
     * Finds an album by its ID.
     * @param {string} id - The ID of the album to find.
     * @returns {Object|undefined} The album object if found, otherwise undefined.
     */
    getAlbumById: function(id) {
        return this.albums.find(album => album.id === id);
    },
    /**
     * Finds a playlist by its ID.
     * @param {string} id - The ID of the playlist to find.
     * @returns {Object|undefined} The playlist object if found, otherwise undefined.
     */
    getPlaylistById: function(id) {
        return this.playlists.find(playlist => playlist.id === id);
    },
    /**
     * Finds an artist by its ID.
     * @param {string} id - The ID of the artist to find.
     * @returns {Object|undefined} The artist object if found, otherwise undefined.
     */
    getArtistById: function(id) {
        return this.artists.find(artist => artist.id === id);
    },
    /**
     * Finds a genre by its ID.
     * @param {string} id - The ID of the genre to find.
     * @returns {Object|undefined} The genre object if found, otherwise undefined.
     */
    getGenreById: function(id) {
        return this.genres.find(genre => genre.id === id);
    },

    // --- Getters for Related Items ---

    /**
     * Retrieves all papers by a specific artist.
     * @param {string} artistId - The ID of the artist.
     * @returns {Array<Object>} An array of paper objects by the specified artist.
     */
    getPapersByArtistId: function(artistId) {
        return this.papers.filter(paper => paper.artist_id === artistId);
    },
    /**
     * Retrieves all papers associated with a specific genre.
     * @param {string} genreId - The ID of the genre.
     * @returns {Array<Object>} An array of paper objects for the specified genre.
     */
    getPapersByGenreId: function(genreId) {
        return this.papers.filter(paper => paper.genre_ids && paper.genre_ids.includes(genreId));
    },
    /**
     * Retrieves all playlists associated with a specific genre.
     * @param {string} genreId - The ID of the genre.
     * @returns {Array<Object>} An array of playlist objects for the specified genre.
     */
    getPlaylistsByGenreId: function(genreId) {
        return this.playlists.filter(playlist => playlist.genre_id === genreId);
    },
    /**
     * Retrieves all albums associated with a specific artist.
     * Assumes `album.artist_ids` is an array of artist IDs on the album object.
     * @param {string} artistId - The ID of the artist.
     * @returns {Array<Object>} An array of album objects by the specified artist.
     */
    getAlbumsByArtistId: function(artistId) {
        return this.albums.filter(album => album.artist_ids && album.artist_ids.includes(artistId));
    },
    /**
     * Retrieves all papers contained in a specific album.
     * @param {string} albumId - The ID of the album.
     * @returns {Array<Object>} An array of paper objects in the specified album. Returns empty if album not found or has no papers.
     */
    getPapersForAlbum: function(albumId) {
        const album = this.getAlbumById(albumId);
        if (!album || !album.paper_ids) return [];
        return album.paper_ids.map(paperId => this.getPaperById(paperId)).filter(paper => paper); // Filter out nulls if a paperID is invalid
    },
    /**
     * Retrieves all papers contained in a specific playlist.
     * @param {string} playlistId - The ID of the playlist.
     * @returns {Array<Object>} An array of paper objects in the specified playlist. Returns empty if playlist not found or has no papers.
     */
    getPapersForPlaylist: function(playlistId) {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist || !playlist.paper_ids) return [];
        return playlist.paper_ids.map(paperId => this.getPaperById(paperId)).filter(paper => paper); // Filter out nulls if a paperID is invalid
    },

    /**
     * Performs a search across all data types based on a query string.
     * The search is case-insensitive and checks various relevant fields for each item type.
     * @param {string} query - The search query string.
     * @returns {{matchedPapers: Array<Object>, matchedAlbums: Array<Object>, matchedPlaylists: Array<Object>, matchedArtists: Array<Object>, matchedGenres: Array<Object>}} An object containing arrays of matched items for each category.
     */
    performSearch: function(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // If the query is empty, return no matches.
        if (!normalizedQuery) {
            return {
                matchedPapers: [], matchedAlbums: [], matchedPlaylists: [],
                matchedArtists: [], matchedGenres: []
            };
        }

        const results = {
            matchedPapers: [], matchedAlbums: [], matchedPlaylists: [],
            matchedArtists: [], matchedGenres: []
        };

        // Search Papers: title, authors, abstract, takeaways, venue
        this.papers.forEach(paper => {
            let found = false;
            if (paper.title && paper.title.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && paper.authors && paper.authors.some(author => author.toLowerCase().includes(normalizedQuery))) found = true;
            if (!found && paper.abstract && paper.abstract.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && paper.takeaways && paper.takeaways.some(takeaway => takeaway.toLowerCase().includes(normalizedQuery))) found = true;
            if (!found && paper.venue && paper.venue.toLowerCase().includes(normalizedQuery)) found = true;

            if (found) results.matchedPapers.push(paper);
        });

        // Search Albums: title, description
        this.albums.forEach(album => {
            let found = false;
            if (album.title && album.title.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && album.description && album.description.toLowerCase().includes(normalizedQuery)) found = true;
            
            if (found) results.matchedAlbums.push(album);
        });

        // Search Playlists: title, summary_article (basic string search)
        this.playlists.forEach(playlist => {
            let found = false;
            if (playlist.title && playlist.title.toLowerCase().includes(normalizedQuery)) found = true;
            // Simple search in summary_article HTML. For more advanced search, HTML stripping would be needed.
            if (!found && playlist.summary_article && playlist.summary_article.toLowerCase().includes(normalizedQuery)) found = true;
            
            if (found) results.matchedPlaylists.push(playlist);
        });

        // Search Artists: name
        this.artists.forEach(artist => {
            if (artist.name && artist.name.toLowerCase().includes(normalizedQuery)) {
                results.matchedArtists.push(artist);
            }
        });

        // Search Genres: name
        this.genres.forEach(genre => {
            if (genre.name && genre.name.toLowerCase().includes(normalizedQuery)) {
                results.matchedGenres.push(genre);
            }
        });

        return results;
    }
};
