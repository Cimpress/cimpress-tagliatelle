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
      expect(ts.baseUrl).toBe('https://tagging.trdlnk.cimpress.io');
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

  describe('getResourceTags(accessToken, resourceUri, namespace)', () => {
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
        body: res,
      });

      ts.getResourceTags('MY_TOKEN', resourceUri)
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
        body: res,
      });

      ts.getResourceTags('MY_TOKEN', resourceUri, 'my-namespace')
        .then((data) => {
          expect(data).toBe(res);
          done();
        })
        .catch(done);
    });
  });


  describe('getResourceTagForKey(accessToken, resourceUri, tagId)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test-template';
    const tagId = 'urn:stereotype:templateName';
    const res = {
      'resourceUri': resourceUri,
      'tagId': tagId,
      'tagValue': 'true',
    };

    test('Throws TagNotFound when tag doesn\'t exist', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(tagId)}&resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {
          results: [],
        },
      });

      ts.getResourceTagForKey('MY_TOKEN', resourceUri, tagId)
        .catch((err) => {
          expect(err).toBeInstanceOf(TagNotFound);
          done();
        });
    });

    test('Get existing tag', (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/tags?key=${encodeURIComponent(tagId)}&resourceUri=${encodeURIComponent(resourceUri)}`, {
        status: 200,
        body: {
            results: [res],
        },
      });

      ts.getResourceTagForKey('MY_TOKEN', resourceUri, tagId)
        .then((data) => {
          expect(data).toBe(res);
          done();
        });
    });
  });

  describe('createTag(accessToken, resourceUri, tagId)', () => {
    const resourceUri = 'https://stereotype.trdlnk.cimpress.io/v1/templates/test';
    const tagId = 'urn:stereotype:templateName';
    const tagValue = 'test';
    const res = {
      resourceUri: resourceUri,
      key: tagId,
      value: tagValue,
    };

    test('Creates a tag', (done) => {
      const ts = new TaggingService();
      mock.post(`${ts.baseUrl}/v0/tags`, {
        status: 200,
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
            const res = {}
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

    describe('getTag(accessToken, id)', () => {
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

            ts.getTag('MY_TOKEN', 'xx')
                .then((data) => {
                    expect(data).toBe(res);
                    done();
                });
        });
    });
});
