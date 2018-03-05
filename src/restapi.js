export default function createRestApi (requestor, endpoint, isCollection = true) {

  const _all = (params = null) => requestor.makeRequest('get', `/${endpoint}`, params)
  const _find = (id, params = null) => requestor.makeRequest('get', `/${endpoint}/${id}`, params)
  const _create = (data) => requestor.makeRequest('post', `/${endpoint}`, data)
  const _update = (id, data) => requestor.makeRequest('put', `/${endpoint}/${id}`, data)
  const _delete = (id) => requestor.makeRequest('delete', `/${endpoint}/${id}`)

  const restApi = (params) => _all(params)

  if (isCollection) {
    restApi.all = _all
    restApi.find = _find
    restApi.create = _create
    restApi.update = _update
    restApi.delete = _delete
  }

  restApi.get = (params = null) => requestor.makeRequest('get', `/${endpoint}`, params)
  restApi.post = (data = null) => requestor.makeRequest('post', `/${endpoint}`, data)

  const restApiProxy = new Proxy(restApi, {
    get (api, prop) {
      if (prop in api) {
        return api[prop]
      }

      return createRestApi(requestor, `${endpoint}/${prop}`, !isCollection)
    }
  })

  return restApiProxy
}
