# Cimpress Tagging Service client

This project contains a thin client library for Cimpress' Tagging service.

## Usage

In order to use the client

`npm install cimpress-tagging-service --save`

and once the package is available

### Import

`const TaggingService = require('cimpress-tagging-service');`

or 

`import TaggingService from 'cimpress-tagging-service'`

### Instantiation
```
const options = {
   baseUrl: 'string', // Base url of the service, by default it will be https://tagging.trdlnk.cimpress.io
   timeout: '3000', // Default: 3000 ms
   retries: 3, // By default there are 3 retries
   retryDelayInMs: 1000 // Default: 1000
}

const taggingService = new TaggingService(options);

```
### Class functions 


```javascript
    const accessToken = "ACCESS_TOKEN"
    const resourceId = "https://stereotype.trdlnk.cimpress.io/v1/templates/demo"
    const namespace= "test-namespace"
    const tagId = "urn:namespace:specification"
    const tagValue = "tag_value"

    // Get all the tags asociated to a resource, filtered by namespace if provided.

    taggingService
        .getTagsByResource(accessToken, resourceUri, namespace) // The 3rd parameter namespace is optional
        .then(data => {
            console.log(data)
            /*
            {
                count: 2,
                total: 2,
                results: [
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                        }
                    }
                },
                {
                    id: '00000000-0000-0000-0000-000000000001',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000001"
                        }
                    }
                },
                ]
            }

            */
        })
    
    // Get all the tags asociated to the resources provided, filtered by namespace if provided.
    const resourcesUris = [
        "https://stereotype.trdlnk.cimpress.io/v1/templates/demo",
        "https://stereotype.trdlnk.cimpress.io/v1/templates/demo2"
    ]
    taggingService
        .getTagsByResources(accessToken, resourcesUris, namespace) // The 3rd parameter namespace is optional
        .then(data => {
            console.log(data)
            /*
            {
                count: 2,
                total: 2,
                results: [
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                        }
                    }
                },
                {
                    id: '00000000-0000-0000-0000-000000000001',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo2',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000001"
                        }
                    }
                },
                ]
            }

            */
        })
        
    // Get the tag asociated with the key and the resourceUri asociated
    const key = "urn:stereotype:isTest";
    taggingService
        .getTagByResourceAndKey(accessToken, resourceUri, key)
        .then(data => {
            console.log(data)
            /*
            {
                id: '00000000-0000-0000-0000-000000000000',
                key: 'urn:stereotype:isTest',
                value: 'true',
                resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                createdAt: '2018-11-01T13:08:11.884Z',
                createdBy: '[SUB]',
                _links: {
                    "self": {
                        "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                    }
                }
            }
            */
        })
    
    
    // Get all the tags with the key provided
    taggingService
        .getTagsByKey(accessToken, key)
        .then(data => {
            console.log(data)
            /*
            {
                count: 2,
                total: 2,
                results: [
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                        }
                    }
                },
                {
                    id: '00000000-0000-0000-0000-000000000001',
                    key: 'urn:stereotype:isTest',
                    value: 'true',
                    resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo2',
                    createdAt: '2018-11-01T13:08:11.884Z',
                    createdBy: '[SUB]',
                    _links: {
                        "self": {
                            "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000001"
                        }
                    }
                },
                ]
            }

            */
        })
        
    // Get the tag with the id provided
    const id = '00000000-0000-0000-0000-000000000000';
    taggingService
        .getTagById(accessToken,id)
        .then(data => {
            console.log(data)
            /*
            {
                id: '00000000-0000-0000-0000-000000000000',
                key: 'urn:stereotype:isTest',
                value: 'true',
                resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                createdAt: '2018-11-01T13:08:11.884Z',
                createdBy: '[SUB]',
                _links: {
                    "self": {
                        "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                    }
                }
            }
            */
        })
    

    // Creates a tag in a specific resource

    const tagValue = true;
    taggingService
        .createTag(accessToken, resourceUri, tagKey, tagValue) 
        .then(tag => {
            console.log(tag);
            /*
            {
                id: '00000000-0000-0000-0000-000000000000',
                key: 'urn:stereotype:isTest',
                value: 'true',
                resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                createdAt: '2018-11-01T13:08:11.884Z',
                createdBy: '[SUB]',
                _links: {
                    "self": {
                        "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                    }
                }
            }
            */
        })
            

    // Updates a tag

    const tagValue = true;
    taggingService
        .updateTag(accessToken, id, resourceUri, key, tagValue) 
        .then(tag => {
            console.log(tag);
            /*
            {
                id: '00000000-0000-0000-0000-000000000000',
                key: 'urn:stereotype:isTest',
                value: 'true',
                resourceUri: 'https://stereotype.trdlnk.cimpress.io/v1/templates/demo',
                createdAt: '2018-11-01T13:08:11.884Z',
                createdBy: '[SUB]',
                _links: {
                    "self": {
                        "href": "https://tagging.trdlnk.cimpress.io/v0/tags/00000000-0000-0000-0000-000000000000"
                    }
                }
            }
            */
        })

    // Deletes a tag

    const tagValue = true;
    taggingService
        .deleteTag(accessToken, id) 
        .then(tag => { /* no-content */})

```

## Support

For any inquiries, we invite you to reach out to the Trdelnik Squad at TrdelnikSquad@cimpress.com.
