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
   timeout: '3000' // Default: 3000 ms
   retries: 3, // By default there are 3 retries
   retryDelayInMs: 1000 // Default: 1000
}

const taggingService = new TaggingService(options);

```
### Class functions 

```
    const accessToken = "ACCESS_TOKEN"
    const resourceId = "http://resources.cimpress.io/testResource"
    const namespace= "test-namespace"
    const tagId = "urn:namespace:specification"
    const tagValue = "tag_value"

    // Get all the tags asociated to a resource, filtered by namespace if provided.

    taggingService
        .getResourceTags(accessToken, resourceId, namespace) // The 3rd parameter namespace is optional
        .then(data => {
            data.forEach(tag => {
                console.log(tag.resourceUri);
                console.log(tag.tagId); // TagId, follows urn format. e.g. urn:namespace:specification
                console.log(tag.tagValue); // Tag value
            })
        })
    
    //Get a single tag

    taggingService
        .getTag(accessToken, resourceId, tagId)
        .then(tag => {
            console.log(tag.resourceUri);
            console.log(tag.tagId); // TagId, follows urn format. e.g. urn:namespace:specification
            console.log(tag.tagValue); // Tag value
        })

    // Creates or updates a tag in a specific resource

    taggingService
        .putTag(accessToken, resourceId, tagId, tagValue) 
        .then(tag => {
            console.log(tag.resourceUri);
            console.log(tag.tagId); // TagId, follows urn format. e.g. urn:namespace:specification
            console.log(tag.tagValue); // Tag value
        })
```

## Support

For any inquiries, we invite you to reach out to the Trdelnik Squad at TrdelnikSquad@cimpress.com.
