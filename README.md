# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

E2E tests call a **running** HTTP API (see `test/lib/request.ts`: host is `localhost` and port is `PORT` from `.env`, default **4000**).

1. Copy `.env.example` to `.env` if you have not already.
2. **Start the API** in one terminal (port must match `PORT` in `.env`), for example:
   - `npm run build && npm run start:prod`, or
   - `npm run start` / `npm run start:dev`
3. In **another** terminal run the tests below.

To run all template tests without authorization (only `test/*.spec.ts`)

```
npm run test
```

To run **additional** custom tests (pagination and sorting in `test/custom/`)

```
npm run test:custom
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging
