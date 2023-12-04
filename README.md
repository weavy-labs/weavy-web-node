# ACME sample project

## Node server configuration

The ACME project requires a backend that provides an authentication system which can communicate with the weavy environment. It's important that the authentication mechanisms and API secrets ***never*** are handled by the client or in the browser.

### .env

You must provide an `.env` file with your *WEAVY_URL* and *WEAVY_APIKEY* to run the ACME server. See the [.env.example](./.env.example) for an example configuration.

```ini
WEAVY_URL="https://mysite.weavy.io"
WEAVY_APIKEY=""
PORT=3001
```

## Web components ACME app

Once you have configured you `.env` you can start up the ACME project. 

```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) with your browser. To login you can use any of the following credentials:
  
  - username: `admin`, `bugs`, `daffy`, `porky`, `tweety`, `wile`, or `meepmeep`
  - password: `acme`