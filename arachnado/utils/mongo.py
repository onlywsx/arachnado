from six.moves.urllib.parse import urlparse

import motor


_CLIENT_CACHE = {}


def motor_from_uri(uri):
    parsed = urlparse(uri)
    db_name, col_name = parsed.path.split('/')[1:]
    _uri = "%s://%s/%s" % (parsed.scheme, parsed.netloc, db_name)
    client_args = parsed.netloc, db_name
    client = _CLIENT_CACHE.get(
        client_args,
        motor.MotorClient(_uri)
    )
    db = client[db_name]
    col = db[col_name]

    return client, db_name, db, col_name, col


def replace_dots(son):
    """Recursively replace keys that contains dots"""
    for key, value in son.items():
        if '.' in key:
            new_key = key.replace('.', '_')
            if isinstance(value, dict):
                son[new_key] = replace_dots(
                    son.pop(key)
                )
            else:
                son[new_key] = son.pop(key)
        elif isinstance(value, dict):  # recurse into sub-docs
            son[key] = replace_dots(value)
    return son

