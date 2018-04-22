# Axios Rest
A simple axios wrapper to make rest api call delightful.

# Example

```javascript
const axiosRestClient = require('axios-rest-client')
const api = axiosRestClient({baseUrl: process.env.API_BASE_URL})

// Get all users
api.users.all().then(response => {
  console.log(response.data)
})

// Create new user
api.users.create({
  firstname: 'John',
  lastname: 'Doe'
})
```


# Installation

```bash
npm install --save axios-rest-client
```

axios-rest require axios to work, so you have to install axios

```bash
npm install --save axios
```

# How to use it ?

Create your axios rest client

```javascript
const axiosRestClient = require('axios-rest-client')

const api = axiosRestClient({
  baseUrl: process.env.API_BASE_URL // this is required
  // see axios for other configuration options
})
```

And that all ! You can start requesting your api

Start by creating endpoint for your resources

```javascript
// Create multiple resources endpoints
api.endpoints({
  users: 'users',           // /users endpoint
  posts: 'post-resources'  // /post-resources endpoint
})

api.endpoint('users')   // Create /users endpoint

// You can access previously endpoint as attribute
// If the endpoint does not exist it will be created automatically
api.users
api.comments    // get endpoint for comments on /comments
```

You can then call

```javascript
api.users.all()               // GET /users
api.users.find(1)             // Get /users/1
api.users.create(data)        // POST /users, body=data
api.users.update(1, data)     // PUT /users/1, body=data
api.users.delete(1)           // DELETE /users/1
```

If you want to create an api endpoint for a single instance of a collection
just call .one(instanceId) on the collection endpoint.

```javascript
api.users.one(1)  // Create entity endpoint for user with id 1
// or simply do
api.users[1]      // to get the /users/1 endpoint automatically created for you
```

You can the call

```javascript
api.users[1].get()        // GET /users/1
api.users[1].post(data)   // POST /users/1, body = data
api.users[1].put(data)    // PUT /users/1, body = data
api.users[1].delete()     // DELETE /users/1
```
