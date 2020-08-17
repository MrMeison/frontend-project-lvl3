export default (xmlString) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xmlString, 'text/xml');

  const parseError = xmlDocument.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent);
  }

  const channelTitle = xmlDocument.querySelector('channel > title').textContent;
  const channelDescription = xmlDocument.querySelector('channel > description').textContent;

  const itemElements = xmlDocument.querySelectorAll('item');
  const items = [...itemElements].map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    return { title, link, description };
  });

  return { title: channelTitle, descrpition: channelDescription, items };
};
