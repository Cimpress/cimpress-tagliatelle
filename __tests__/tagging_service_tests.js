'use strict';

const mock = require('xhr-mock').default;
const TaggingService = require('../src/TaggingService');
const TagNotFound = require('../src/errors/TagNotFound');

describe('x', function() {
    it('y', function() {
        let c = new TaggingService();
        let token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qbENNemxCTnpneE1ETkJSVFpHTURFd09ETkRSalJGTlRSR04wTXpPRUpETnpORlFrUTROUSJ9.eyJodHRwczovL2NsYWltcy5jaW1wcmVzcy5pby93YXMiOlsiYWRmc3xpc3RhbmlzaGV2QGNpbXByZXNzLmNvbSJdLCJodHRwczovL2NsYWltcy5jaW1wcmVzcy5pby9jaW1wcmVzc19pbnRlcm5hbCI6dHJ1ZSwiaHR0cHM6Ly9jbGFpbXMuY2ltcHJlc3MuaW8vdGVuYW50cyI6WyJjaW1wcmVzcyJdLCJodHRwczovL2NsYWltcy5jaW1wcmVzcy5pby9lbWFpbCI6ImlzdGFuaXNoZXZAY2ltcHJlc3MuY29tIiwiaXNzIjoiaHR0cHM6Ly9jaW1wcmVzcy5hdXRoMC5jb20vIiwic3ViIjoid2FhZHx1LXhkczdFeUhKWE1SRGZpZmJ1M21rbEttYXJuNlZ3bnc0VE9mMFU2Sk1zIiwiYXVkIjpbImh0dHBzOi8vYXBpLmNpbXByZXNzLmlvLyIsImh0dHBzOi8vY2ltcHJlc3MuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTU0MDg4OTQyNiwiZXhwIjoxNTQwOTAzODI2LCJhenAiOiJHMTdIZE5kMDFnQVBmaVNWNXVwYldkaURVbkFVOGlzOSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwifQ.VLl6Gtlj7rPhg5Ll_UbAk2TQkGn2N46dkE98fEkdDYLagb4KC7qf2QvSduNmWeW0Ge0jqz-ty8-GdVgfKQvDf56tsl1DXjbn8767L4ZIGZ1Q6z2YKE_heZxIDMGtumaoEc__9JPG77dofwKel19owJYdrTD7ILqyp3JsudsV3NLnDi0TxOJKBHeL1JVPEhwMCSEFsElcGfsbdLCxha_hxxC1wMCeUKj4dYEAoVylAqo84_Dd7PbBzCuTot90kQIvDWGmF-KWF0mCAmM7n3ATEQVt0nqAMu9rl0dbVF_Du4iKYdT0zl3s7kUVYnafbC0TivhgLnZJsBKo2gPGyUBo_g';
        let key='urn:stereotype:templateName';
        let value = 'Default Platform Order Request Email';
        let resourceUri = "https://stereotype.trdlnk.cimpress.io/v1/templates/orderRequest-50268a40-Default Platform Order Request Email (with complete information set and merchant item id)";

        //return c.updateTag(token, '977425e5-cd52-491d-a816-ea4fe6373cae', resourceUri, key, value );
        return c.createTag(token, resourceUri, 'urn:stereotype:templateDescription', 'This template provides a complete set of order information, merchant item id' );
    });
});

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
