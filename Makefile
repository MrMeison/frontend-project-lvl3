install:
	npm install

build:
	npm run build

start:
	npx webpack-dev-server

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
