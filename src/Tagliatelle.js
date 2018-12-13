import axios from 'axios';
import axiosRetry from 'axios-retry';
import TagNotFound from './errors/TagNotFound';
import ConflictError from './errors/ConflictError';
import qs from 'qs';

const DEFAULT_BASE_URL = 'https://tagliatelle.trdlnk.cimpress.io';

class Tagliatelle {
    constructor(clientOptions) {
        const understoodOptions = ['baseUrl', 'timeout', 'retryAttempts', 'retryDelayInMs', 'autoFetchPagedResults'];
        const options = clientOptions || {};
        const timeout = parseInt(options.timeout, 10);
        const retryAttempts = parseInt(options.retryAttempts, 10);
        const retryDelayInMs = parseInt(options.retryDelayInMs, 10);

        this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
        this.timeout = timeout >= 0 ? timeout : 3000;
        this.retryAttempts = retryAttempts >= 0 ? retryAttempts : 3;
        this.retryDelayInMs = retryDelayInMs >= 0 ? retryDelayInMs : 1000;
        this.autoFetchPagedResults = options.autoFetchPagedResults || false;

        Object
            .keys(options)
            .forEach((passedOption) => {
                if (understoodOptions.indexOf(passedOption) === -1) {
                    // eslint-disable-next-line no-console
                    console.error(`[Tagliatelle] Option '${passedOption}' is not understood and will be ignored.`);
                }
            });
    }

    __getAxiosInstance(accessToken) {
        let instance = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: {
                Authorization: `Bearer ${accessToken.replace('Bearer ', '')}`,
            },
        });

        if (this.retryAttempts > 0) {
            axiosRetry(instance, {
                retries: this.retryAttempts,
                retryDelay: (retryCount) => {
                    return this.retryDelayInMs;
                },
            });
        }

        return instance;
    }

    async getTags(accessToken, searchParams) {
        let results = await this.__getTagsPartial(accessToken, searchParams);
        if (!this.autoFetchPagedResults || results.total === results.count + (results.offset||0)) {
            return results;
        }

        let total = results.total;
        let fullResults = results;
        let retrievedCount = results.count;
        while (retrievedCount < total) {
            searchParams.offset = retrievedCount;
            let partial = await this.__getTagsPartial(accessToken, searchParams);
            retrievedCount += partial.count;
            fullResults.count = retrievedCount;
            fullResults.results = fullResults.results.concat(partial.results);
        }
        return fullResults;
    }

    async __getTagsPartial(accessToken, searchParams) {
        let uris = [];
        if (Array.isArray(searchParams.resourceUri) && searchParams.resourceUri.length > 0) {
            uris = uris.concat(searchParams.resourceUri);
        } else if (searchParams.resourceUri) {
            uris.push(searchParams.resourceUri);
        }

        let keys = [];
        if (Array.isArray(searchParams.key) && searchParams.key.length > 0) {
            keys = keys.concat(searchParams.key);
        } else if (searchParams.key) {
            keys.push(searchParams.key);
        }

        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.get(`${this.baseUrl}/v0/tags`, {
            params: {
                namespace: searchParams.namespace ? searchParams.namespace : undefined,
                key: keys.length > 0 ? keys : undefined,
                resourceUri: uris.length > 0 ? uris : undefined,
                offset: Number.isInteger(Number(searchParams.offset)) && Number(searchParams.offset)>0 ? searchParams.offset : undefined,
            },
            paramsSerializer: (params) => qs.stringify(params, {indices: false}),
        });

        return response.data;
    }

    async getTagsByResource(accessToken, resourceUri, namespace = null, offset = null) {
        return this.__getTagsPartial(accessToken, {resourceUri, namespace, offset});
    }

    async getTagsByResources(accessToken, resourcesUriArray, namespace = null, offset = null) {
        return this.__getTagsPartial(accessToken, {resourceUri: resourcesUriArray, namespace, offset});
    }

    async getTagByResourceAndKey(accessToken, resourceUri, tagKey, offset = null) {
        return this.__getTagsPartial(accessToken, {resourceUri, key: tagKey, offset})
            .then((res) => {
                const results = res.results;
                if (results.length === 0) {
                    throw new TagNotFound();
                }
                return results[0];
            });
    }

    async getTagsByKey(accessToken, tagKey, offset = null) {
        return this.__getTagsPartial(accessToken, {key: tagKey, offset});
    }

    async getTagById(accessToken, id) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        try {
            const response = await axiosInstance.get(`${this.baseUrl}/v0/tags/${encodeURIComponent(id)}`);
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                throw new TagNotFound();
            }
            throw err;
        }
    }

    async createOrUpdateTag(accessToken, resourceUri, tagKey, tagValue) {
        return this.__getTagsPartial(accessToken, {resourceUri, key: tagKey})
            .then((res) => {
                const results = res.results;
                if (results.length === 0) {
                    return this.createTag(accessToken, resourceUri, tagKey, tagValue);
                }
                if (results.length === 1) {
                    return this.updateTag(accessToken, results[0].id, resourceUri, tagKey, tagValue);
                }
                throw new ConflictError('Multiple tags matching.');
            });
    }

    async createTag(accessToken, resourceUri, tagKey, tagValue) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.post(`${this.baseUrl}/v0/tags`, {
            key: tagKey,
            value: tagValue,
            resourceUri: resourceUri,
        });
        return response.data;
    }

    async updateTag(accessToken, id, resourceUri, tagKey, tagValue) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.put(`${this.baseUrl}/v0/tags/${encodeURIComponent(id)}`, {
            key: tagKey,
            value: tagValue,
            resourceUri: resourceUri,
        });
        return response.data;
    }

    async deleteTag(accessToken, id) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.delete(`${this.baseUrl}/v0/tags/${encodeURIComponent(id)}`);
        return response.data;
    }
}

module.exports = Tagliatelle;
