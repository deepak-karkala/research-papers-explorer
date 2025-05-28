const dataService = {
    papers: [],
    albums: [],
    playlists: [],
    artists: [],
    genres: [],

    async loadAllData() {
        try {
            const [papersResponse, albumsResponse, playlistsResponse, artistsResponse, genresResponse] = await Promise.all([
                fetch('data/papers.json'),
                fetch('data/albums.json'),
                fetch('data/playlists.json'),
                fetch('data/artists.json'),
                fetch('data/genres.json')
            ]);

            if (!papersResponse.ok || !albumsResponse.ok || !playlistsResponse.ok || !artistsResponse.ok || !genresResponse.ok) {
                throw new Error('Failed to load one or more data files.');
            }

            this.papers = await papersResponse.json();
            this.albums = await albumsResponse.json();
            this.playlists = await playlistsResponse.json();
            this.artists = await artistsResponse.json();
            this.genres = await genresResponse.json();

            console.log('Data loaded successfully:', this);
            return true; // Indicate success
        } catch (error) {
            console.error('Error loading data:', error);
            // In a real app, you might want to display this error to the user
            return false; // Indicate failure
        }
    },

    // --- General Getters ---
    getPapers: function() { return this.papers; },
    getAlbums: function() { return this.albums; },
    getPlaylists: function() { return this.playlists; },
    getArtists: function() { return this.artists; },
    getGenres: function() { return this.genres; },

    // --- Getters by ID ---
    getPaperById: function(id) {
        return this.papers.find(paper => paper.id === id);
    },
    getAlbumById: function(id) {
        return this.albums.find(album => album.id === id);
    },
    getPlaylistById: function(id) {
        return this.playlists.find(playlist => playlist.id === id);
    },
    getArtistById: function(id) {
        return this.artists.find(artist => artist.id === id);
    },
    getGenreById: function(id) {
        return this.genres.find(genre => genre.id === id);
    },

    // --- Getters for Related Items ---
    getPapersByArtistId: function(artistId) {
        return this.papers.filter(paper => paper.artist_id === artistId);
    },
    getPapersByGenreId: function(genreId) {
        return this.papers.filter(paper => paper.genre_ids && paper.genre_ids.includes(genreId));
    },
    getPlaylistsByGenreId: function(genreId) {
        return this.playlists.filter(playlist => playlist.genre_id === genreId);
    },
    getAlbumsByArtistId: function(artistId) {
        // Albums might have multiple artists, paper_ids is an array of paper IDs
        // This implementation assumes artist_ids is an array in albums.json
        return this.albums.filter(album => album.artist_ids && album.artist_ids.includes(artistId));
    },
    // Example of getting papers for an album (utility, might be more useful in app.js)
    getPapersForAlbum: function(albumId) {
        const album = this.getAlbumById(albumId);
        if (!album) return [];
        return album.paper_ids.map(paperId => this.getPaperById(paperId)).filter(paper => paper); // Filter out nulls if paperID is invalid
    },
    // Example of getting papers for a playlist
    getPapersForPlaylist: function(playlistId) {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) return [];
        return playlist.paper_ids.map(paperId => this.getPaperById(paperId)).filter(paper => paper);
    },

    performSearch: function(query) {
        const normalizedQuery = query.toLowerCase().trim();
        if (!normalizedQuery) {
            return {
                matchedPapers: [],
                matchedAlbums: [],
                matchedPlaylists: [],
                matchedArtists: [],
                matchedGenres: []
            };
        }

        const results = {
            matchedPapers: [],
            matchedAlbums: [],
            matchedPlaylists: [],
            matchedArtists: [],
            matchedGenres: []
        };

        // Search Papers
        this.papers.forEach(paper => {
            let found = false;
            if (paper.title && paper.title.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && paper.authors && paper.authors.some(author => author.toLowerCase().includes(normalizedQuery))) found = true;
            if (!found && paper.abstract && paper.abstract.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && paper.takeaways && paper.takeaways.some(takeaway => takeaway.toLowerCase().includes(normalizedQuery))) found = true;
            if (!found && paper.venue && paper.venue.toLowerCase().includes(normalizedQuery)) found = true; // Added venue search

            if (found) results.matchedPapers.push(paper);
        });

        // Search Albums
        this.albums.forEach(album => {
            let found = false;
            if (album.title && album.title.toLowerCase().includes(normalizedQuery)) found = true;
            if (!found && album.description && album.description.toLowerCase().includes(normalizedQuery)) found = true;
            
            if (found) results.matchedAlbums.push(album);
        });

        // Search Playlists
        this.playlists.forEach(playlist => {
            let found = false;
            if (playlist.title && playlist.title.toLowerCase().includes(normalizedQuery)) found = true;
            // Simple search in summary_article (HTML content). For more advanced, would need HTML stripping.
            if (!found && playlist.summary_article && playlist.summary_article.toLowerCase().includes(normalizedQuery)) found = true;
            
            if (found) results.matchedPlaylists.push(playlist);
        });

        // Search Artists
        this.artists.forEach(artist => {
            if (artist.name && artist.name.toLowerCase().includes(normalizedQuery)) {
                results.matchedArtists.push(artist);
            }
        });

        // Search Genres
        this.genres.forEach(genre => {
            if (genre.name && genre.name.toLowerCase().includes(normalizedQuery)) {
                results.matchedGenres.push(genre);
            }
        });

        return results;
    }
};
