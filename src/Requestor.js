import axios from 'axios'
import createRestApi from './restapi'

const inRange = (value, min, max) => value >= min && value <= max

export default class Requestor {
  constructor ({baseUrl}) {
    this.apiCache = {}
    this.baseUrl = baseUrl
    this.requestTransformers = []
    this.responseTransformers = []

    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        'Accept': 'application/json'
      }
    })
  }

  /**
   * Get internal axios instance
   *
   * @return Axios
   */
  axios () {
    return this.axios
  }

  /**
   * Create RestApi proxy
   *
   * @param String endpoint
   * @param String name
   *
   * @return Proxy[RestApi]
   */
  api (endpoint, name) {
    const cacheKey = name || endpoint

    if (this.apiCache[cacheKey]) {
      return this.apiCache[cacheKey]
    }

    const api = createRestApi(this, endpoint)

    this.apiCache[cacheKey] = api

    return api
  }

  /**
   * Performs http request using axios
   *
   * @param String method
   * @param String url
   * @param Object paramsOrData
   *
   * @return Promise
   */
  async makeRequest (method, url, paramsOrData) {
    const requestConfig = {
      url: url,
      method: method
    }

    if (method === 'get') {
      requestConfig['params'] = paramsOrData
    } else {
      requestConfig['data'] = paramsOrData
    }

    // Run request transformers
    if (this.requestTransformers.length) {
      this.requestTransformers.forEach(transformer => {
        transformer(requestConfig)
      })
    }


    try {
      const response = await this.axios.request(requestConfig)
      return this.transformResponse(response)
    } catch (error) {
      if (error.response) {
        return this.transformResponse(error.response)
      }

      throw error
    }
  }

  wrapAxiosResponse (axiosResponse) {
    const wrappedResponse = {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      config: axiosResponse.config,
      headers: axiosResponse.headers,
      data: axiosResponse.data
    }

    wrappedResponse.isOk = wrappedResponse.status == 200
    wrappedResponse.isCreated = wrappedResponse.status == 201
    wrappedResponse.isBadRequest = wrappedResponse.status == 400
    wrappedResponse.isForbidden = wrappedResponse.status == 403
    wrappedResponse.isNotFound = wrappedResponse.status == 404
    wrappedResponse.isServerError = wrappedResponse.status == 500

    wrappedResponse.isSuccessful = inRange(wrappedResponse.status, 200, 299)
    wrappedResponse.isClientError = inRange(wrappedResponse.status, 400, 499)

    return wrappedResponse
  }

  transformResponse (response) {
    const wrappedResponse = this.wrapAxiosResponse(response)

    // Run request tranformers
    if (this.responseTransformers.length) {
      this.responseTransformers.forEach(transformer => transformer(wrappedResponse))
    }

    return wrappedResponse
  }

  addRequestTransformer (transformer) {
    this.requestTransformers.push(transformer)

    return this
  }

  addRequestTransformer (transformer) {
    this.responseTransformers.push(transformer)

    return this
  }
}
