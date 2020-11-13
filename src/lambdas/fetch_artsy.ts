import { APIGatewayProxyEvent } from "aws-lambda";
import { Artist, Resource } from "../../src/types"
import axios from "axios";
import { AxiosPromise } from "axios";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};
const buildParams = (input: string): string => {
  return input
}

const apiClient = axios.create({
  baseURL: 'https://api.artsy.net/api',
  responseType: 'json',
  headers: { 'Content-Type': 'application/json' }
})

const wrapAxios = (req: AxiosPromise<any>) =>
  req
    .then((r) => ({
      statusCode: 200,
      body: JSON.stringify(r.data),
      headers,
    }))
    .catch((e) => ({
      statusCode: e.response?.status || 500,
      body: e.response?.data ? JSON.stringify(e.response.data) : e.message,
      headers,
    }));

const fetchToken = async (): Promise<string> => (
  await apiClient.post("/tokens/xapp_token", {
    client_id: process.env.ARTSY_CLIENT_ID,
    client_secret: process.env.ARTSY_CLIENT_SECRET
  })
    .then((result) => result.data.token)
    .catch((error) => Promise.reject(new Error(error)))
)

const fetchArtist = async (artist_url: string, token: string): Promise<any> => (
  await apiClient.get(artist_url, { headers: { 'X-Xapp-Token': token } })
    .then((result) => ({
      statusCode: 200,
      body: JSON.stringify(result.data),
      headers
    }))
    .catch((e) => ({
      statusCode: e.response?.status || 500,
      body: e.response?.data ? JSON.stringify(e.response.data) : e.message,
      headers,
    })
))

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
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const token: string = await fetchToken()
  const artistName = event.queryStringParameters && event.queryStringParameters['artistName']
  return await searchArtist(`${artistName}`, token)
};
