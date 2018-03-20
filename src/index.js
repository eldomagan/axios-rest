import Requestor from './Requestor'

export default function axiosRest(config) {
  if (!config.baseUrl) {
    throw new Error('config.baseUrl is required')
  }

  const requestor = new Requestor(config)
  const apiProxy = new Proxy(requestor, {
    get (requestor, property) {
      return property in requestor ? requestor[property] : requestor.endpoint(property)
    }
  })

  return apiProxy
}
