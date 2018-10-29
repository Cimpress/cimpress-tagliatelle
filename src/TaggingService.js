import axios from 'axios';
import axiosRetry from 'axios-retry';
import TagNotFound from './errors/TagNotFound';

const DEFAULT_BASE_URL = 'https://tagging.trdlnk.cimpress.io';

class TaggingService {
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
                    console.error(`[TaggingService] Option '${passedOption}' is not understood and will be ignored.`);
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

    async getResourceTags(accessToken, resourceUri, namespace = null) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.get(`${this.baseUrl}/v0/tags`, {
            params: {
                namespace: namespace ? namespace : undefined,
                resourceUri: resourceUri,
            },
        });
        return response.data;
    }

    async getResourceTagForKey(accessToken, resourceUri, tagKey) {
        const axiosInstance = this.__getAxiosInstance(accessToken);
        const response = await axiosInstance.get(`${this.baseUrl}/v0/tags`, {
            params: {
                key: tagKey,
                resourceUri: resourceUri,
            },
        });

        if ( response.data.results.length === 0) {
            throw new TagNotFound();
        }

        return response.data.results[0];
    }

    async getTag(accessToken, id) {
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

    async createTag(accessToken, id, resourceUri, tagKey, tagValue) {
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

module.exports = TaggingService;
