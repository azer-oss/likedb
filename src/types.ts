export interface IDBOptions {
  testing?: boolean
}

export interface INewBookmark {
  url: string
  title?: string
  tags?: string[]
  createdAt?: number
}

export interface IBookmark {
  url: string
  title: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

export interface IBookmarkWithTags {
  url: string
  title: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface IListOptions {
  limit?: number
  offset?: number
}

export interface IDBRow {
  continue: () => void
  value: IBookmark
}
