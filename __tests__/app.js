import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

import init from '../src/app.js';

const userEvent = testingLibraryUserEvent;

const proxy = 'https://cors-anywhere.herokuapp.com';
const rssUrl = 'http://lorem-rss.herokuapp.com/feed?unit=second&interval=30';
const rssFeedXml = fs.readFileSync(path.join('__fixtures__', 'feed.xml'), 'utf-8');

nock.disableNetConnect();
axios.defaults.adapter = httpAdapter;

let elements;

beforeEach(async () => {
  const pathToFixture = path.join('public', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;

  await init();

  elements = {
    input: screen.getByRole('textbox', { name: 'url' }),
    submit: screen.getByRole('button', { name: 'add' }),
  };
});

test('invalid url', async () => {
  await userEvent.type(elements.input, 'invalid url');
  userEvent.click(elements.submit);

  expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument();
});

test('add rss feed', async () => {
  const scope = nock(proxy)
    .get(`/${rssUrl}`)
    .reply(200, rssFeedXml);

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText(/RSS feed has been loaded/i)).toBeInTheDocument();
  });

  expect(screen.getByText(/Lorem ipsum feed/i)).toBeInTheDocument();

  scope.done();
});

test('add duplicate rss feed', async () => {
  const scope = nock(proxy)
    .get(`/${rssUrl}`)
    .reply(200, rssFeedXml);

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText(/RSS feed has been loaded/i)).toBeInTheDocument();
  });

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  expect(screen.getByText(/RSS feed already exists/i)).toBeInTheDocument();

  scope.done();
});
