export interface IAPIOptions {
  apiKey: string
  apiSecret: string
  host?: string
}

export interface ICallback {
  (error?: Error, response?: object): void
}
