import axios from 'axios';
import axiosRetry from 'axios-retry';
import TagNotFound from './errors/TagNotFound';
import qs from 'qs';

const DEFAULT_BASE_URL = 'https://tagliatelle.trdlnk.cimpress.io';

class Tagliatelle {
    constructor(clientOptions) {
        const understoodOptions = ['baseUrl', 'timeout', 'retryAttempts', 'retryDelayInMs'];
        const options = clientOptions || {};
        const timeout = parseInt(options.timeout, 10);
        const retryAttempts = parseInt(options.retryAttempts, 10);
        const retryDelayInMs = parseInt(options.retryDelayInMs, 10);

        this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
        this.timeout = timeout >= 0 ? timeout : 3000;
        this.retryAttempts = retryAttempts >= 0 ? retryAttempts : 3;
        this.retryDelayInMs = retryDelayInMs >= 0 ? retryDelayInMs : 1000;

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
        let uris = [];
        if (Array.isArray(searchParams.resourceUri) && searchParams.resourceUri.length > 0) {
            uris = uris.concat(searchParams.resourceUri);
        } else if (searchParams.resourceUri) {
            uris.push(searchParams.resourceUri);
        }

        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.get(`${this.baseUrl}/v0/tags`, {
            params: {
                namespace: searchParams.namespace ? searchParams.namespace : undefined,
                key: searchParams.key ? searchParams.key : undefined,
                resourceUri: uris.length > 0 ? uris : undefined,
            },
            paramsSerializer: (params) => qs.stringify(params, {indices: false}),
        });

        return response.data;
    }


    async getTagsByResource(accessToken, resourceUri, namespace = null) {
        return this.getTags(accessToken, {resourceUri, namespace});
    }

    async getTagsByResources(accessToken, resourcesUriArray, namespace = null) {
        return this.getTags(accessToken, {resourceUri: resourcesUriArray, namespace});
    }

    async getTagByResourceAndKey(accessToken, resourceUri, tagKey) {
        return this.getTags(accessToken, {resourceUri, key: tagKey})
            .then((res) => {
                const results = res.results;
                if (results.length === 0) {
                    throw new TagNotFound();
                }
                return results[0];
            });
    }

    async getTagsByKey(accessToken, tagKey) {
        return this.getTags(accessToken, {key: tagKey});
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