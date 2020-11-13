import axios from "axios";
import { da } from "date-fns/locale";
import { addButtonListener, pushBullets, WindowClient  } from 'roam-client';
import { Artist, Resource } from "../../src/types"

const apiClient = axios.create({
  baseURL: 'https://api.artsy.net/api',
  responseType: 'json',
  headers: { 'Content-Type': 'application/json' }
});

const fetchToken = async (): Promise<string> => (
  await apiClient.post("/tokens/xapp_token", {
    client_id: process.env.ARTSY_CLIENT_ID,
    client_secret: process.env.ARTSY_CLIENT_SECRET
  })
    .then((result) => result.data.token)
    .catch((error) => Promise.reject(new Error(error)))
)

const fetchArtist = async (artist_url: string, token: string): Promise<Artist> => (
  await apiClient.get(artist_url, { headers: { 'X-Xapp-Token': token } })
    .then((result) => result.data)
    .catch((error) => Promise.reject(new Error(error)))
)

const searchArtist = async (query: string, token: string): Promise<Artist> => {
  return await apiClient.get(`/search?q=/${query}+more:pagemap:metatags-og_type:artist`, {
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
    .catch((error) => Promise.reject(new Error(error)))
}

const artistData = (artist: Artist): string[]=> {
  const hometown = artist.hometown.split(",").map((t) => `[[${t.trim()}]]`).join(", ")
  return [
    `* url:: ${artist._links['permalink']['href']}`,
    `* thumbnail::`,
    `  * ![](${artist._links['thumbnail']['href']})`,
    `* bio::`,
    `  * ${artist.biography}`,
    `* birth year:: ${artist.birthday}`,
    `* death year:: ${artist.deathday}`,
    `* hometown:: ${hometown}`,
    `* nationality:: [[${artist.nationality}]]`,
  ]
}

addButtonListener('arta', async (a, b) => {
  console.log('addButtonListener', [a, b])

  const artistName = document.title
  console.log(`Finding info for ${artistName}`)

  const token: string = await fetchToken()
  const artist: Artist = await searchArtist(`${artistName}`, token)
  console.log(Object.keys(artist._links))

  console.log(artistData(artist).join("\n"))
  pushBullets(artistData(artist))
})
