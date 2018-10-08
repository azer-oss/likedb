import { types as idbTypes } from "indexeddb"

export interface IAPIOptions {
  apiKey: string
  apiSecret: string
  host?: string
  postRetryIntervalSecs?: number
  postIntervalSecs?: number
  onPostUpdates?: (result: any) => void
  onReceiveUpdates?: (updates: idbTypes.IUpdate[]) => void
  onError?: (error: Error, action: string) => void
}

export interface ICallback {
  (error?: Error, result?: any): void
}
