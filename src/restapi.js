/**
 * Create api endpoint
 *
 * ```javascript
 * // Create users collections endpoint
 * const users = createCollectionEnpoint(requestor, 'users')
 *
 * // Fetch all users
 * users()
 * users.all()
 * ```
 *
 * @param Requestor requestor
 * @param String endpoint
 * @param Boolean isCollection
 */
export default function createApiEndpoint (requestor, endpoint, isCollection = true) {
  const _get = (params = null) => requestor.makeRequest('get', `/${endpoint}`, params)
  const _post = (data) => requestor.makeRequest('post', `/${endpoint}`, data)

  /**
   *
   * @param {*} params
   */
  const apiEndpoint = function (params = null) {
    // calling endpoint() is equivalent to endpoint.all()
    return _get(params)
  }

  if (isCollection) {
    apiEndpoint.all = _get
    apiEndpoint.create = _post
    apiEndpoint.find = (id, params = null) => requestor.makeRequest('get', `/${endpoint}/${id}`, params)
    apiEndpoint.update = (id, data) => requestor.makeRequest('put', `/${endpoint}/${id}`, data)
    apiEndpoint.delete = apiEndpoint.remove = (id) => requestor.makeRequest('delete', `/${endpoint}/${id}`)
    apiEndpoint.one = (key) => requestor.endpoint(`${endpoint}/${key}`, `${endpoint}_${key}`, false)
  } else {
    apiEndpoint.get = _get
    apiEndpoint.post = _post
    apiEndpoint.put = (data) => requestor.makeRequest('put', `/${endpoint}`, data)
    apiEndpoint.delete = () => requestor.makeRequest('delete', `/${endpoint}`, data)
  }

  // Wrap the endpoint with a proxy to handle undefined property as another api endpoint
  // undefined property on collection endpoint return entity endpoint
  // and collection endpoint on entity endpoint
  const apiEndpointProxy  = new Proxy(apiEndpoint, {
    get (apiEndpoint, prop) {
      if (prop in apiEndpoint) {
        return apiEndpoint[prop]
      }

      return requestor.endpoint(`${endpoint}/${prop}`, `${endpoint}_${prop}`, !isCollection)
    }
  })

  return apiEndpointProxy
}
