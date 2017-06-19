import logging
from functools import partial

from arachnado.storages.mongotail import MongoTailStorage


class Sites(object):
    """ 'Known sites' object exposed via JSON-RPC """
    logger = logging.getLogger(__name__)

    def __init__(self, handler, site_storage, **kwargs):
        self.handler = handler
        self.storage = site_storage  # type: MongoTailStorage

    def list(self):
        return self.storage.fetch()

    def post(self, site):
        self.storage.create(site)

    def patch(self, site):
        self.storage.update(site)

    def delete(self, site):
        self.storage.delete(site)

    def subscribe(self):
        self.storage.subscribe('created', self.created_publish)
        self.storage.subscribe('updated', self.updated_publish)
        self.storage.subscribe('deleted', self.deleted_publish)

    def _on_close(self):
        self.storage.unsubscribe(self.storage.available_events)

    def created_publish(self, data):
        return self._publish('created', data)

    def updated_publish(self, data):
        return self._publish('updated', data)

    def deleted_publish(self, data):
        return self._publish('deleted', data)

    def _publish(self, event, data):
        self.handler.write_event({'event': 'sites.{}'.format(event), 'data': data})
