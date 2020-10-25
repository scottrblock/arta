enum ImageVersion {
    four_thirds,
    large,
    square,
    tall
}

export type Link = {
    name: string,
    href: string
}

export type Resource = {
    type: string
}


export type Artist = {
    id: string,
    slug: string,
    created_at: Date,
    updated_at: Date,
    name: string,
    gender: string,
    biography: string,
    birthday: Date,
    deathday: Date,

    // will geotag later
    hometown: string,
    location: string,
    nationality: string,
    image_versions: ImageVersion[],

    "_links": Link[]
}