# ecmascript

Install Jest:
```
yarn add --dev jest
```
or
```
npm install --save-dev jest
```

This downloads and adds the necessary node modules to the `node_modules` directory. It also adds a `package.json` file.

Add the following to `package.json`:
```
  "scripts": {
    "test": "jest"
  }
```
The `package.json` file will now look something like this:
```
{
  "devDependencies": {
    "jest": "^24.0.0"
  },
  "scripts": {
    "test": "jest"
  }
}
```
Run tests:
```
yarn test (or npm run test)
```
