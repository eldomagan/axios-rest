import axios from 'axios'
import createApiEndpoint from './restapi'

const inRange = (value, min, max) => value >= min && value <= max

export default class Requestor {
  constructor (config) {
    this.apiCache = {}
    this.baseUrl = config.baseUrl
    this.options = {}
    this.currentRequestOptions = {}
    this.requestTransformers = []
    this.responseTransformers = []

    const axiosConfig = Object.assign({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json'
      }
    }, config)

    this._axios = axios.create(axiosConfig)
  }

  /**
   * Get internal axios instance
   *
   * @return Axios
   */
  axios () {
    return this._axios
  }

  /**
   * Set request header for all requests
   *
   * @param {String} header
   * @param {String} value
   */
  setHeader (header, value) {
    this._axios.defaults.headers.common[header] = value
  }

  /**
   * Set multiple request headers
   *
   * @param {Object} headers
   */
  setHeaders (headers) {
    for (let header in headers) {
      this.setHeader(header, headers[header])
    }
  }

  /**
   * Create collection endpoint
   *
   * @param String endpoint
   * @param String name
   *
   * @return Proxy[RestApi]
   */
  endpoint (endpoint, name, isCollection = true) {
    const cacheKey = name || endpoint.replace(/\//g, '_')

    if (this.apiCache[cacheKey]) {
      return this.apiCache[cacheKey]
    }

    const api = createApiEndpoint(this, endpoint, isCollection)

    this.apiCache[cacheKey] = api

    return api
  }

  /**
   * Create some endpoint
   *
   * @param {*} endpoints
   */
  endpoints (endpoints) {
    for (let name in endpoints) {
      this.endpoint(endpoints[name], name)
    }
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
      const response = await this._axios.request(requestConfig)
      return this.transformResponse(response)
    } catch (error) {
      if (error.response) {
        return this.transformResponse(error.response)
      }

      throw error
    }
  }

  transformResponse (response) {
    const wrappedResponse = this._wrapAxiosResponse(response)

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

  _wrapAxiosResponse (axiosResponse) {
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
    wrappedResponse.isServerError = inRange(wrappedResponse.status, 500, 599)

    return wrappedResponse
  }
}
