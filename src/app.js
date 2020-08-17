import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import parseRss from './rss.js';
import watch from './watchers/index.js';

const responseTimeout = 3000;
const proxyUrl = 'https://cors-anywhere.herokuapp.com';

const urlValidationSchema = yup.string().url().required();

const getFeedUrl = (url) => `${proxyUrl}/${url}`;

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const validationSchema = urlValidationSchema.notOneOf(feedUrls, 'Rss feed already exists');
  try {
    validationSchema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const loadRss = (watchedState, url) => {
  watchedState.loadingState.status = 'loading';
  const urlWithProxy = getFeedUrl(url);
  return axios.get(urlWithProxy, { timeout: responseTimeout })
    .then((response) => {
      const feedData = parseRss(response.data);
      const feed = { url, title: feedData.title };
      const posts = feedData.items.map((item) => ({ ...item, feedUrl: feed.url }));
      watchedState.posts.push(...posts);
      watchedState.feeds.unshift(feed);

      watchedState.loadingState = {
        error: null,
        status: 'idle',
      };
      watchedState.form = {
        ...watchedState.form,
        status: 'filling',
        error: null,
      };
    })
    .catch((e) => {
      watchedState.loadingStateState = {
        error: e,
        status: 'failed',
      };
      throw e;
    });
};

export default () => {
  const initState = {
    feeds: [],
    posts: [],
    loadingState: {
      status: 'idle',
      error: null,
    },
    form: {
      error: null,
      status: 'filling',
      valid: false,
    },
  };

  const formElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedbackBox: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
  };

  const watchedState = watch(initState, formElements);

  formElements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const data = new FormData(evt.target);
    const url = data.get('url');
    const error = validateUrl(url, watchedState.feeds);
    if (error) {
      watchedState.form = {
        status: watchedState.form.status,
        valid: false,
        error,
      };
    }

    watchedState.form = {
      status: watchedState.form.status,
      valid: true,
      error: null,
    };
    loadRss(watchedState, url);
  });
};