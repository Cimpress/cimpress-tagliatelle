'use strict';

const mock = require('xhr-mock').default;
const TaggingService = require("../src/TaggingService");
const TagNotFound = require("../src/errors/TagNotFound");

describe("TaggingService", () => {

  beforeEach(() => mock.setup());
  afterEach(() => mock.teardown());

  describe("Constructor ", () => {


    test("Constructs correctly without params", () => {
      const ts = new TaggingService()
      expect(ts.baseUrl).toBe("https://tagging.trdlnk.cimpress.io");
      expect(ts.timeout).toBe(3000);
      expect(ts.retryAttempts).toBe(3);
      expect(ts.retryDelayInMs).toBe(1000);
    });

    test("Constructs correctly with params", () => {
      const params = {
        baseUrl: 'https://tagging2.cimpress.io',
        timeout: 1000,
        retryAttempts: 6,
        retryDelayInMs: 0
      }
      const ts = new TaggingService(params);
      expect(ts.baseUrl).toBe(params.baseUrl);
      expect(ts.timeout).toBe(params.timeout);
      expect(ts.retryAttempts).toBe(params.retryAttempts);
      expect(ts.retryDelayInMs).toBe(params.retryDelayInMs);
    });

    test("Unrecognised param shows console.error", () => {
      console.error = jest.fn()
      const params = {
        fakeParam: 1234,
      }
      const ts = new TaggingService(params);
      expect(console.error).toBeCalled();
    });

  });

  describe("getResourceTags(accessToken, resourceId, namespace)", () => {

    const resourceId = "https://stereotype.trdlnk.cimpress.io/v1/templates/test-template"
    const res = [
      {
        "resourceUri": resourceId,
        "tagId": "urn:stereotype:templateType",
        "tagValue": "xml"
      },
      {
        "resourceUri": resourceId,
        "tagId": "urn:pollAndMail:templateIsActive",
        "tagValue": "true"
      }
    ]

    test("No namespace specified returns correct values", (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/resources/${encodeURIComponent(resourceId)}/tags`, {
        status: 200,
        body: res
      });

      ts.getResourceTags("MY_TOKEN", resourceId)
        .then(data => {
          expect(data).toBe(res);
          done()
        })
        .catch(done)
    });

    test("Namespace specified returns correct values", (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/resources/${encodeURIComponent(resourceId)}/tags?namespace=my-namespace`, {
        status: 200,
        body: res
      });

      ts.getResourceTags("MY_TOKEN", resourceId, "my-namespace")
        .then(data => {
          expect(data).toBe(res);
          done()
        })
        .catch(done)
    });

  });


  describe("getTag(accessToken, resourceId, tagId)", () => {

    const resourceId = "https://stereotype.trdlnk.cimpress.io/v1/templates/test-template"
    const tagId = "urn:stereotype:templateName"
    const res = {
      "resourceUri": resourceId,
      "tagId": tagId,
      "tagValue": "true"
    }

    test("Throws TagNotFound when tag doesn't exist", (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/resources/${encodeURIComponent(resourceId)}/tags/${tagId}`, {
        status: 404,
        body: "NOT FOUND"
      });

      ts.getTag("MY_TOKEN", resourceId, tagId)
        .catch(err => {
          expect(err).toBeInstanceOf(TagNotFound);
          done()
        })
    });

    test("Get existing tag", (done) => {
      const ts = new TaggingService();
      mock.get(`${ts.baseUrl}/v0/resources/${encodeURIComponent(resourceId)}/tags/${tagId}`, {
        status: 200,
        body: res
      });

      ts.getTag("MY_TOKEN", resourceId, tagId)
        .then(data => {
          expect(data).toBe(res);
          done()
        })
    });

  });

  describe("putTag(accessToken, resourceId, tagId)", () => {

    const resourceId = "https://stereotype.trdlnk.cimpress.io/v1/templates/test"
    const tagId = "urn:stereotype:templateName"
    const tagValue = "test"
    const res = {
      resourceUri: resourceId,
      tagId,
      tagValue
    }

    test("Creates/updates a tag", (done) => {
      const ts = new TaggingService();
      mock.put(`${ts.baseUrl}/v0/resources/${encodeURIComponent(resourceId)}/tags/${tagId}`, {
        status: 200,
        body: res
      });

      ts.putTag("MY_TOKEN", resourceId, tagId, "test")
        .then(data => {
          expect(data).toBe(res);
          done()
        })
    });

  });

});