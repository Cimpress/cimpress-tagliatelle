class TagNotFound {
    constructor(message, data) {
        this.message = message;
        this._data = data;
    }

    get data() {
        return this._data;
    }
}
module.exports = TagNotFound;
