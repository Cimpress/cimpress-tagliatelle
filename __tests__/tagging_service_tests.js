'use strict';

const mock = require('xhr-mock').default;
const TaggingService = require('../src/TaggingService');
const TagNotFound = require('../src/errors/TagNotFound');

describe('TaggingService', () => {
  beforeEach(() => mock.setup());
  afterEach(() => mock.teardown());

  describe('Constructor ', () => {
    test('Constructs correctly without params', () => {
      const ts = new TaggingService();
      expect(ts.baseUrl).toBe('https://tagliatelle.trdlnk.cimpress.io');
      expect(ts.timeout).toBe(3000);
      expect(ts.retryAttempts).toBe(3);
      expect(ts.retryDelayInMs).toBe(1000);
    });

    test('Constructs correctly with params', () => {
      const params = {
        baseUrl: 'https://tagging2.cimpress.io',
        timeout: 1000,
        retryAttempts: 6,
        retryDelayInMs: 0,
      };
      const ts = new TaggingService(params);
      expect(ts.baseUrl).toBe(params.baseUrl);
      expect(ts.timeout).toBe(params.timeout);
      expect(ts.retryAttempts).toBe(params.retryAttempts);
      expect(ts.retryDelayInMs).toBe(params.retryDelayInMs);
    });

    test('Unrecognised param shows console.error', () => {
      console.error = jest.fn();
      const params = {
        fakeParam: 1234,
      };
      const ts = new TaggingService(params);
      expect(console.error).toBeCalled();
    });
  });

  describe('getTagByResource(accessToken, resourceUri, namespace)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template';
    const res = [
      {
        'resourceUri': resourceUri,
        'key': 'urn:stereotype:templateType',
        'value': 'xml',
      },
      {
        'resourceUri': resourceUri,
        'key': 'urn:pollAndMail:templateIsActive',
        'value': 'true',
      },
    ];

    test('No namespace specified returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {data: res},
      });

      ts.getTagsByResource('MY_TOKEN', resourceUri)
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });

    test('Namespace specified returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?namespace=my-namespace&resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {data: res},
      });

      ts.getTagsByResource('MY_TOKEN', resourceUri, 'my-namespace')
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });
  });

  describe('getTagsByResources(accessToken, resourcesUriArray, namespace)', () => {
    const resourcesUris = [
      'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template',
      'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template2',
    ];
    const res = [
      {
        'resourceUri': resourcesUris[0],
        'key': 'urn:stereotype:templateType',
        'value': 'xml',
      },
      {
        'resourceUri': resourcesUris[1],
        'key': 'urn:pollAndMail:templateIsActive',
        'value': 'true',
      },
    ];

    test('No namespace specified returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?resourceUri=${encodeURIComponent(resourcesUris[0])}&resourceUri=${encodeURIComponent(resourcesUris[1])}`, {
        status: 200,
        body: {data: res},
      });
      ts.getTagsByResources('MY_TOKEN', resourcesUris)
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });

    test('Namespace specified returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?namespace=my-namespace&resourceUri=${encodeURIComponent(resourcesUris[0])}&resourceUri=${encodeURIComponent(resourcesUris[1])}`, {
        status: 200,
        body: {data: res},
      });

      ts.getTagsByResource('MY_TOKEN', resourcesUris, 'my-namespace')
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });
  });


  describe('getTagByResourceAndKey(accessToken, resourceUri, tagKey)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template';
    const key = 'urn:stereotype:templateType'
    const res = {
      'resourceUri': resourceUri,
      'key': key,
      'value': 'xml',
    };

    test('Returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(key)}&resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {
          data: {
            results: [res],
          }
        },
      });
      ts.getTagByResourceAndKey('MY_TOKEN', resourceUri, key)
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });

    test('Throws TagNotFound when tag doesn\'t exist', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(key)}&resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {
          data: {results: []},
        },
      });

      ts.getTagByResourceAndKey('MY_TOKEN', resourceUri, key)
        .catch((err) => {
          expect(err).toBeInstanceOf(TagNotFound);
          done();
        });
    });
  });


  describe('getTagsByKey(accessToken, tagKey)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template';
    const tagKey = 'urn:stereotype:templateName';
    const res = {
      'resourceUri': resourceUri,
      'tagKey': tagKey,
      'tagValue': 'true',
    };

    test('Get existing tags', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(tagKey)}`, {
        status: 200,
        body: {
          data: {results: [res]},
        },
      });

      ts.getTagsByKey('MY_TOKEN', tagKey)
        .then((data) => {
          expect(data).toEqual({results: [res]});
          done();
        });
    });

    test('Get existing tags, no results', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(tagKey)}`, {
        status: 200,
        body: {
          data: {results: []},
        },
      });

      ts.getTagsByKey('MY_TOKEN', tagKey)
        .then((data) => {
          expect(data).toEqual({results: []});
          done();
        });
    });
  });

  describe('getTagById(accessToken, id)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template';
    const id = '000000000-0000-0000-0000-000000000000'
    const res = {
      'resourceUri': resourceUri,
      'key': 'urn:stereotype:templateType',
      'value': 'xml',
    };

    test('Returns correct values', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags/${encodeURIComponent(id)}`, {
        status: 200,
        body: res,
      });
      ts.getTagById('MY_TOKEN', id)
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });

    test('Throws TagNotFound when tag doesn\'t exist', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags/${encodeURIComponent(id)}`, {
        status: 404,
        body: {
          data: {results: []},
        },
      });

      ts.getTagById('MY_TOKEN', id)
        .catch((err) => {
          expect(err).toBeInstanceOf(TagNotFound);
          done();
        });
    });
  });


  describe('createTag(accessToken, resourceUri, tagId)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test';
    const tagId = 'urn:stereotype:templateName';
    const tagValue = 'test';
    const res = {
      id: 'd3d7e128-c21f-4e57-9838-9ac01c81cd04',
      key: tagId,
      value: tagValue,
      resourceUri: resourceUri,
      createdAt: '2018-11-01T11:30:25.293Z',
      createdBy: "waad|B13t3vPMnXqfQY8Eu2VlPbu7bR-K5Y7aufebBlqye0E",
      _links: {
        self: {
          href: "https://tagging.trdlnk.cimpress.io/v0/tags/d3d7e128-c21f-4e57-9838-9ac01c81cd04"
        }
      }
    };

    test('Creates a tag', (done) => {
      const ts = new TaggingService();
      mock.post(`${ts.baseUrl}/v0/tags`, {
        status: 201,
        body: res,
      });

      ts.createTag('MY_TOKEN', resourceUri, tagId, 'test')
        .then((data) => {
          expect(data).toBe(res);
          done();
        });
    });
  });

  describe('updateTag(accessToken, id, resourceUri, tagId, tagValue)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test';
    const tagId = 'urn:stereotype:templateName';
    const tagValue = 'test-2';
    const res = {
      resourceUri: resourceUri,
      key: tagId,
      value: tagValue,
    };

    test('Updates a tag', (done) => {
      const ts = new TaggingService();
      mock.put(`${ts.baseUrl}/v0/tags/xx`, {
        status: 200,
        body: res,
      });

      ts.updateTag('MY_TOKEN', 'xx', resourceUri, tagId, 'test')
        .then((data) => {
          expect(data).toBe(res);
          done();
        });
    });
  });

  describe('deleteTag(accessToken, id)', () => {
    test('Delete a tag', (done) => {
      const ts = new TaggingService();
      const res = {};
      mock.delete(`${ts.baseUrl}/v0/tags/xx`, {
        status: 204,
        body: res,
      });

      ts.deleteTag('MY_TOKEN', 'xx')
        .then((data) => {
          expect(data).toBe(res);
          done();
        });
    });
  });

  describe('getTagById(accessToken, id)', () => {
    test('Get a tag', (done) => {
      const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test';
      const tagId = 'urn:stereotype:templateName';
      const tagValue = 'test-2';
      const res = {
        resourceUri: resourceUri,
        key: tagId,
        value: tagValue,
      };

      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags/xx`, {
        status: 204,
        body: res,
      });

      ts.getTagById('MY_TOKEN', 'xx')
        .then((data) => {
          expect(data).toBe(res);
          done();
        });
    });
  });
});
