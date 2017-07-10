export function jsonAjax(url, data, type) {
    if(typeof(type) === 'undefined') {
        type = 'post';
    }
    if (!data) {
        data = {}
    }
    data['token'] = window.localStorage.token
    return $.ajax(url, {
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(data)
    });
}