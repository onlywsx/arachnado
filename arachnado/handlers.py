# -*- coding: utf-8 -*-
from __future__ import absolute_import
import os

from tornado.web import Application, RequestHandler, url, HTTPError
from tornado import gen
from tornado.ioloop import IOLoop
import datetime
from os import getenv
import uuid
import json

from arachnado.utils.misc import json_encode, makeToken, checkToken
from arachnado.monitor import Monitor
from arachnado.handler_utils import ApiHandler, NoEtagsMixin
from arachnado.utils.mongo import motor_from_uri

from arachnado.rpc.data import PagesDataRpcWebsocketHandler, JobsDataRpcWebsocketHandler

from arachnado.rpc import RpcHttpHandler
from arachnado.rpc.ws import RpcWebsocketHandler
from scrapy.signalmanager import SignalManager


at_root = lambda *args: os.path.join(os.path.dirname(__file__), *args)


def get_application(crawler_process, domain_crawlers,
                    site_storage, item_storage, job_storage, spider_storage, user_storage, opts):
    context = {
        'crawler_process': crawler_process,
        'domain_crawlers': domain_crawlers,
        'job_storage': job_storage,
        'site_storage': site_storage,
        'item_storage': item_storage,
        'spider_storage': spider_storage,
        'user_storage': user_storage,
        'opts': opts,
    }
    debug = opts['arachnado']['debug']

    handlers = [
        # UI
        url(r"/", Index, context, name="index"),
        url(r"/help", Help, context, name="help"),
        url(r"/login", Login, context, name="login"),

        # simple API used by UI
        url(r"/crawler/start", StartCrawler, context, name="start"),
        url(r"/crawler/stop", StopCrawler, context, name="stop"),
        url(r"/crawler/pause", PauseCrawler, context, name="pause"),
        url(r"/crawler/resume", ResumeCrawler, context, name="resume"),
        url(r"/crawler/save", SaveCrawler, context, name="save"),
        url(r"/crawler/remove", RemoveCrawler, context, name="remove"),
        url(r"/crawler/status", CrawlerStatus, context, name="status"),
        url(r"/ws-updates", Monitor, context, name="ws-updates"),

        # RPC API
        url(r"/ws-rpc", RpcWebsocketHandler, context, name="ws-rpc"),
        url(r"/rpc", RpcHttpHandler, context, name="rpc"),
        url(r"/ws-pages-data", PagesDataRpcWebsocketHandler, context, name="ws-pages-data"),
        url(r"/ws-jobs-data", JobsDataRpcWebsocketHandler, context, name="ws-jobs-data"),
    ]
    return Application(
        handlers=handlers,
        template_path=at_root("templates"),
        compiled_template_cache=not debug,
        static_hash_cache=not debug,
        static_path=at_root("static"),
        # no_keep_alive=True,
        compress_response=True,
    )


class BaseRequestHandler(RequestHandler):

    def initialize(self, crawler_process, domain_crawlers,
                   site_storage, spider_storage, user_storage, opts, **kwargs):
        """
        :param arachnado.crawler_process.ArachnadoCrawlerProcess
            crawler_process:
        """
        self.crawler_process = crawler_process
        self.domain_crawlers = domain_crawlers
        self.site_storage = site_storage
        self.spider_storage = spider_storage
        self.user_storage = user_storage
        self.opts = opts
        self.key = opts['arachnado']['key']

    def render(self, *args, **kwargs):
        proc_stats = self.crawler_process.procmon.get_recent()
        kwargs['initial_process_stats_json'] = json_encode(proc_stats)
        return super(BaseRequestHandler, self).render(*args, **kwargs)

    
class Index(NoEtagsMixin, BaseRequestHandler):

    def get(self):
        jobs = self.crawler_process.jobs
        spiders = self.domain_crawlers.spiders

        initial_data_json = json.dumps(json_encode({"jobs": jobs, "spiders": spiders}))
        return self.render("index.html", initial_data_json=initial_data_json)


class Help(BaseRequestHandler):
    def get(self):
        return self.render("help.html")

class Login(ApiHandler, BaseRequestHandler):
    def get(self):
        return self.render("login.html")

    @gen.coroutine
    def post(self):
        if self.is_json:
            username = self.json_args.get('username', None)
            password = self.json_args.get('password', None)
            query = {"username": username, "password": password}
            docs = []
            cursor = self.user_storage.col.find(query)
            while (yield cursor.fetch_next):
                doc = cursor.next_object()
                docs.append(doc)
            if docs:
                token = makeToken(self.key)
                self.write({"status": "ok", "token": token})
            else:
                self.write({"status": "error"})


class SaveCrawler(ApiHandler, BaseRequestHandler):

    def save_spiders(self, spider_id, domain, args, settings):
        doc = {
            'domain': domain,
            'args': args,
            'settings': settings,
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow(),
        }
        if spider_id:
            doc['_id'] = spider_id
            return self.spider_storage.update(doc)
        else:
            return self.spider_storage.create(doc)

    def post(self):
        if self.is_json:
            if not checkToken(self.key, self.json_args):
                return self.redirect("/login")
            spider_id = self.json_args.get('_id', None)
            domain = self.json_args['domain']
            args = self.json_args.get('options', {}).get('args', {})
            settings = self.json_args.get('options', {}).get('settings', {})
            if self.save_spiders(spider_id, domain, args, settings):
                self.domain_crawlers.get_spider(self.spider_storage)
                self.write({"status": "ok"})
            else:
                self.write({"status": "error"})


class RemoveCrawler(ApiHandler, BaseRequestHandler):

    def remove_spiders(self, spider_id):
        if spider_id:
            doc = {'_id': spider_id}
            return self.spider_storage.delete(doc)

    def post(self):
        if self.is_json:
            if not checkToken(self.key, self.json_args):
                return self.redirect("/login")
            spider_id = self.json_args.get('_id', None)
            if self.remove_spiders(spider_id):
                self.domain_crawlers.get_spider(self.spider_storage)
                self.write({"status": "ok"})
            else:
                self.write({"status": "error"})


class StartCrawler(ApiHandler, BaseRequestHandler):
    """
    This endpoint starts crawling for a domain.
    """
    def crawl(self, domain, args, settings):
        self.crawler = self.domain_crawlers.start(domain, args, settings)
        return bool(self.crawler)

    def post(self):
        if self.is_json:
            if not checkToken(self.key, self.json_args):
                return self.redirect("/login")
            domain = self.json_args['domain']
            args = self.json_args.get('options', {}).get('args', {})
            settings = self.json_args.get('options', {}).get('settings', {})
            if self.crawl(domain, args, settings):
                self.write({"status": "ok",
                            "job_id": self.crawler.spider.crawl_id})
            else:
                self.write({"status": "error"})
        else:
            domain = self.get_body_argument('domain')
            if self.crawl(domain, {}, {}):
                self.redirect("/")
            else:
                raise HTTPError(400)


class _ControlJobHandler(ApiHandler, BaseRequestHandler):
    def control_job(self, job_id, **kwargs):
        raise NotImplementedError

    def post(self):
        if self.is_json:
            if not checkToken(self.key, self.json_args):
                return self.redirect("/login")
            job_id = self.json_args['job_id']
            self.control_job(job_id)
            self.write({"status": "ok"})
        else:
            data = {}
            data['token'] = self.get_body_argument('token')
            if not checkToken(self.key, data):
                return self.redirect("/login")
            job_id = self.get_body_argument('job_id')
            self.control_job(job_id)
            self.redirect("/")


class StopCrawler(_ControlJobHandler):
    """ This endpoint stops a running job. """
    def control_job(self, job_id):
        self.crawler_process.stop_job(job_id)


class PauseCrawler(_ControlJobHandler):
    """ This endpoint pauses a job. """
    def control_job(self, job_id):
        self.crawler_process.pause_job(job_id)


class ResumeCrawler(_ControlJobHandler):
    """ This endpoint resumes a paused job. """
    def control_job(self, job_id):
        self.crawler_process.resume_job(job_id)


class CrawlerStatus(BaseRequestHandler):
    """ Status for one or more jobs. """
    # FIXME: does it work? Can we remove it? It is not used
    # by Arachnado UI.
    def get(self):
        crawl_ids_arg = self.get_argument('crawl_ids', '')

        if crawl_ids_arg == '':
            jobs = self.crawler_process.get_jobs()
        else:
            crawl_ids = set(crawl_ids_arg.split(','))
            jobs = [job for job in self.crawler_process.get_jobs()
                    if job['id'] in crawl_ids]

        self.write(json_encode({"jobs": jobs}))
