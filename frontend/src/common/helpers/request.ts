import config from '@config/config'

type MethodType = 'GET' | 'POST'

export interface EndpointType {
  bodyParams?: Record<string, MaybeArrayEndPointValueType>
  headers?: Record<string, MaybeArrayEndPointValueType>
  method: 'GET' | 'POST'
  queryParams?: Record<string, MaybeArrayEndPointValueType>
  url: string
}
interface EncryptionValueType {
  encryption: 'base64_decode' | 'base64_encode' | 'hmac_decrypt' | 'hmac_encrypt'
  value: MaybeArrayEndPointValueType
}

type EndPointValueType = EncryptionValueType | number | string

type MaybeArrayEndPointValueType = EndPointValueType | EndPointValueType[]

interface OptionsType {
  body?: FormData | string
  headers?: Record<string, string>
  method?: MethodType
  signal?: AbortSignal
}

type QueryParam = Record<string, number | string>

export type ApiResponseType = Record<string, number | string>

export interface Response<T> {
  code: 'ERROR' | 'SUCCESS' | 'VALIDATION'
  data: T
  message?: string
  status: 'error' | 'success'
}

// eslint-disable-next-line unicorn/no-null
const replaceUndefined = (_: string, value: unknown) => (value === undefined ? null : value)

export default async function queryRequest<T>(
  action: string,
  data?: any | FormData | null | Record<string, unknown> | undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
  queryParam?: null | QueryParam | undefined,
  method: MethodType = 'POST',
  options?: OptionsType,
  isPro = false
): Promise<Response<T>> {
  const { API_URL, NONCE, PRO_API_URL } = config
  const baseUrl = isPro && PRO_API_URL ? PRO_API_URL : API_URL
  const uri = new URL(`${baseUrl}/${action}`, `${window.location.protocol}//${window.location.host}`)

  // append query params in url
  if (queryParam !== null) {
    for (const key in queryParam) {
      if (key) {
        uri.searchParams.append(key, queryParam[key as keyof QueryParam].toString())
      }
    }
  }

  const fetchOptions: OptionsType = {
    headers: { 'x-wp-nonce': NONCE },
    method,
    ...options
  }

  if (method.toLowerCase() === 'post') {
    fetchOptions.body = data instanceof FormData ? data : JSON.stringify(data, replaceUndefined)
  }

  try {
    let res
    try {
      res = await fetch(uri, fetchOptions)
    } catch (error) {
      throw new Error(`Failed to resJsonfetch: ${error}`)
    }

    let resJson
    try {
      resJson = await res.json()
    } catch (error) {
      console.error('Failed to parse response', error)
      throw { code: 'ERROR', data: await res.text(), status: 'error' } as unknown
    }

    if (!res.ok) {
      throw resJson
    }

    return resJson as Response<T>
  } catch (error) {
    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.reject(error)
  }
}

export async function proxyRequest<T>(data: EndpointType): Promise<Response<T>> {
  return request<T>('proxy/route', data).catch(error => error as Response<T>)
}

export async function request<T>(
  action: string,
  data?: any | FormData | null | Record<string, unknown> | undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
  queryParam?: null | QueryParam | undefined,
  method: MethodType = 'POST',
  options?: OptionsType,
  isPro = false
): Promise<Response<T>> {
  return queryRequest<T>(action, data, queryParam, method, options, isPro).catch(
    error => error as Response<T>
  )
}
