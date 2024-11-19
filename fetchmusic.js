const dotenv = require('dotenv');

dotenv.config()

//this the code for get accsess token form spotify api

// Step 1: Get the Access Token from Spotify
async function getAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID; // Replace with your Client ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET; // Replace with your Client Secret

    // Base64 encode clientId and clientSecret
    const encodedCredentials = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;  // Return the access token
}

// Step 2: Use the Access Token to Search for Tracks
async function searchTracks(query) {
    const accessToken = await getAccessToken();  // Get the access token

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    const data = await response.json();

    // Log the tracks information
    if (data.tracks && data.tracks.items.length > 0) {
        data.tracks.items.forEach(track => {
            console.log(`Track: ${track.name}`);
            console.log(`Artist: ${track.artists[0].name}`);
            console.log(`Album: ${track.album.name}`);
            console.log(`Preview URL: ${track.preview_url}`);
            console.log('---');
        });
    } else {
        console.log('No tracks found.');
    }
}


// Search for tracks by 'Drake'
//To search for a track, you can simply call the searchTracks() function and pass the query as a parameter. For example, to search for tracks by the artist "Drake":

searchTracks('tu he to').then(() => {
    console.log('Search completed.');
}).catch(error => {
    console.error('Error searching tracks:', error);
});




// Function to start/resume playback on the active device
function startPlayback(token, trackUri) {
    fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: [trackUri]  // The URI of the track you want to play
        }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Playback started!');
        } else {
            console.log('Error starting playback', response.status);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Example usage
const accessToken = getAccessToken() ;
const trackUri = 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6'; // Example track URI
startPlayback(accessToken, trackUri);


