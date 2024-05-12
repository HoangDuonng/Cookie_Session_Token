const base64url = str => {
    return btoa(str)
        .replace(/\+/, '-')
        .replace(/\//, '-')
        .replace(/\=/, '');
};

module.exports = {base64url};
