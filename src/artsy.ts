import axios from "axios";
import { da } from "date-fns/locale";
import { Artist, Link, Resource } from "../src/types"
require('dotenv').config();


export const fetchToken = async () => {
    const clientId = process.env.ARTSY_CLIENT_ID
    const clientSecret = process.env.ARTSY_CLIENT_SECRET
    const apiUrl = 'https://api.artsy.net/api/tokens/xapp_token';

    return await axios.post(apiUrl, {
        client_id: clientId,
        client_secret: clientSecret
    })
        .then((result) => result.data.token)
        .catch((error) => console.log('there is error', error))
}

export const fetchArtist = async (artist_url: string, token: string): Promise<void | Artist> => {
    return await axios.get(artist_url, { headers: { 'X-Xapp-Token': token } })
        .then((result) => result.data)
        .catch((error) => console.error(error))
}

export const searchArtist = async (query: string, token: string): Promise<void | Artist> => {
    return await axios.get(`https://api.artsy.net/api/search?q=/${query}+more:pagemap:metatags-og_type:artist`, {
        headers: { 'X-Xapp-Token': token }
    })
        .then((result) => {
            const artists = result.data['_embedded']['results'].filter((resource: Resource) => resource['type'] === 'artist')
            if (artists.length == 0) {
                throw new Error(`No artists found for query: ${query}`)
            } else {
                return fetchArtist(artists[0]['_links']['self']['href'], token)
            }
        })
        .then((result) => result)
        .catch((error) => console.error(error))
}

(async () => {
    if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
    const token = await fetchToken()
    const artistOrVoid: Artist | void = await searchArtist("Andy Wwarhol", token)

    if (typeof (artistOrVoid) === 'undefined') {
        console.log('Unknown error')
    } else {
        const artist: Artist = artistOrVoid
        return artist
    }
})()