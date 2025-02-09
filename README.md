## Installation and Setup
```
bun i -g @rawnam/freephite-cli

# Get a Github Access Token from https://github.com/settings/tokens
# Use a "classic token" for now (7/14/2023)
fp auth-fp -t <YOUR_GITHUB_ACCESS_TOKEN>
```

## Update the CLI
```
bun i -g @rawnam/freephite-cli@latest
```


## (WIP) Develop Locally
```
git clone https://github.com/rawnam/freephite
cd freephite
bun i

# Install turbo
npm i -g turbo
turbo build

# To test your local build
node ~path/to/freephite/dist/src/index.js
```

## Publish
```
cd ~path/to/freephite/
npm publish
```
