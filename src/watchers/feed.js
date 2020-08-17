const getPostElement = (post) => {
  const li = document.createElement('li');
  const a = document.createElement('a');

  a.href = post.link;
  a.textContent = post.title;
  li.appendChild(a);

  return li;
};

const renderFeeds = (state, formElements) => {
  const { feeds, posts } = state;
  const { feedsBox } = formElements;
  const content = feeds.map((feed) => {
    const fragment = document.createDocumentFragment();
    const feedPosts = posts.filter((post) => post.feedUrl === feed.url);
    const titleElement = document.createElement('h2');
    titleElement.textContent = feed.title;
    const postListElement = document.createElement('ul');
    postListElement.append(...feedPosts.map((post) => getPostElement(post)));
    fragment.append(titleElement, postListElement);
    return fragment;
  });

  feedsBox.innerHtml = '';
  feedsBox.append(...content);
};

export default (state, formElements) => {
  renderFeeds(state, formElements);
};
