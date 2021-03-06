from __future__ import absolute_import
import json
import time
import base64
from six.moves.urllib.parse import urlparse

from scrapy.utils.serialize import ScrapyJSONEncoder
from bson.objectid import ObjectId

# XXX: this is copy-pasted  to make motor_exporter independent
class JSONEncoder(ScrapyJSONEncoder):

    def __init__(self, *args, **kwargs):
        kwargs['ensure_ascii'] = False
        super(JSONEncoder, self).__init__(*args, **kwargs)

    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super(JSONEncoder, self).default(o)

_encoder = JSONEncoder()


def json_encode(obj, encoding=None):
    """
    Encode a Python object to JSON.
    Unlike standard json.dumps, datetime.datetime and ObjectID
    objects are supported.

    >>> json_encode([{"o": ObjectId("303132333435363738396162")}, 123])
    '[{"o": "303132333435363738396162"}, 123]'
    """
    return _encoder.encode(obj)


def decorate_methods(method_names, decorator):
    """ Class decorator which applies a decorator to all specified methods """
    def _decorator(cls):
        for name in method_names:
            wrapped = decorator(getattr(cls, name))
            setattr(cls, name, wrapped)
        return cls
    return _decorator


def add_scheme_if_missing(url):
    """
    >>> add_scheme_if_missing("example.com/foo")
    'http://example.com/foo'
    >>> add_scheme_if_missing("https://example.com/foo")
    'https://example.com/foo'
    >>> add_scheme_if_missing("//example.com/foo")
    'http://example.com/foo'
    """
    if url.startswith("//"):
        url = "http:" + url
    if "://" not in url:
        url = "http://" + url
    return url


def get_netloc(url):
    """
    >>> get_netloc("example.org/")
    'example.org'
    >>> get_netloc("http://example.org/foo")
    'example.org'
    >>> get_netloc("http://blog.example.org/foo")
    'blog.example.org'
    """
    return urlparse(add_scheme_if_missing(url)).netloc

def encode(key, dec):
    dec = json.dumps(dec)
    enc = []
    for i in range(len(dec)):
        key_c = key[i % len(key)]
        enc_c = chr((ord(dec[i]) + ord(key_c)) % 256)
        enc.append(enc_c)
    return base64.urlsafe_b64encode("".join(enc))

def decode(key, enc):
    dec = []
    enc = base64.urlsafe_b64decode(enc)
    for i in range(len(enc)):
        key_c = key[i % len(key)]
        dec_c = chr((256 + ord(enc[i]) - ord(key_c)) % 256)
        dec.append(dec_c)
    return json.loads("".join(dec))


def checkToken(key, data):
    if 'token' in data and data['token']:
        token = decode(key, str(data['token']))
        expire = token['expire'] if 'expire' in token else None
        if expire and time.time() < expire:
            return True
    return False

def makeToken(key):
    expire = time.time() + 30*24*60*60
    enc = {
        'expire': expire
    }
    return encode(key, enc)
