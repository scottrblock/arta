import axios from "axios";
import { da } from "date-fns/locale";
import { addButtonListener, pushBullets, WindowClient  } from 'roam-client';
import { Artist, Resource } from "../../src/types"

const artistData = (artist: Artist): string[]=> {
  const hometown = artist.hometown.split(",").map((t) => `[[${t.trim()}]]`).join(", ")
  return [
    `url:: ${artist._links['permalink']['href']}`,
    `thumbnail::`,
    `. ![](${artist._links['thumbnail']['href']})`,
    `bio::`,
    `  ${artist.biography}`,
    `birth year:: ${artist.birthday}`,
    `death year:: ${artist.deathday}`,
    `hometown:: ${hometown}`,
    `nationality:: [[${artist.nationality}]]`,
  ]
}

addButtonListener('arta', async (a, b) => {
  console.log('addButtonListener', [a, b])

  const artistName = document.title
  console.log(`Finding info for ${artistName}`)
  axios(
    `https://arta.netlify.app/.netlify/functions/fetch_artsy?artistName=${encodeURIComponent(artistName)}`
  )
    .then(async (r) => {
      console.log('back at it again with the data')
      console.log(r.data)
      const data = r.data;
      if (Object.keys(data).length === 0) {
        await new Error("No data found");
        return;
      }

      const artist = r.data
      console.log(Object.keys(artist._links))

      console.log(artistData(artist).join("\n"))
      await pushBullets(artistData(artist))
    })
    .catch((e) =>(new Error(e)))
});