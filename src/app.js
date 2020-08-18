import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import parseRss from './rss.js';
import watch from './watchers/index.js';
import resources from './locales/index.js';

const responseTimeout = 3000;
const fetchingTimeout = 3000;
const proxyUrl = 'https://cors-anywhere.herokuapp.com';

const getUrlValidationSchema = () => yup.string()
  .url(i18next.t('errors.invalidUrl'))
  .required(i18next.t('errors.required'));

const getFeedUrl = (url) => `${proxyUrl}/${url}`;

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const validationSchema = getUrlValidationSchema().notOneOf(feedUrls, i18next.t('errors.exists'));
  try {
    validationSchema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const loadRss = (watchedState, url) => {
  watchedState.loadingState = {
    error: null,
    status: 'loading'
  };

  return axios.get(getFeedUrl(url), { timeout: responseTimeout })
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
      watchedState.loadingState = {
        error: e,
        status: 'failed',
      };
      throw e;
    });
};

const checkNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    return axios.get(getFeedUrl(feed.url), { timeout: responseTimeout })
      .then((response) => {
        const feedData = parseRss(response.data);
        const newPosts = feedData.items.map((item) => ({ ...item, feedUrl: feed.url }));
        const oldPosts = watchedState.posts.filter((post) => post.feedUrl === feed.url);

        return _.differenceWith(newPosts, oldPosts, (a, b) => a.link === b.link);
    });
  });
  Promise.all(promises)
    .then((feedPosts) => {
      watchedState.posts.unshift(..._.flatten(feedPosts));
    })
    .finally(() => {
      setTimeout(() => checkNewPosts(watchedState), fetchingTimeout);
    })
};

const initApp = () => {
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
  setTimeout(() => checkNewPosts(watchedState), fetchingTimeout);

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

      return;
    }

    watchedState.form = {
      status: watchedState.form.status,
      valid: true,
      error: null,
    };
    loadRss(watchedState, url);
  });
}

export default () => {
  i18next.init({
    fallbackLng: 'en',
    load: 'currentOnly',
    resources,
  }).then(() => initApp());
};
