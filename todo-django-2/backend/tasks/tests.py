"""Run: python manage.py test -v 2"""
from rest_framework.test import APITestCase

from .models import Task

URL = "/api/tasks/"


class TaskApiTests(APITestCase):
    def make(self, **kw):
        body = {"title": "Write report", "description": "Q3", "deadline": "2030-01-01", "priority": "High"}
        body.update(kw)
        return self.client.post(URL, body, format="json")

    def test_create_and_get(self):
        r = self.make()
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data["status"], "Pending")
        self.assertEqual(self.client.get(f"{URL}{r.data['id']}/").data["title"], "Write report")

    def test_empty_title_rejected(self):
        for title in ("", "   ", None):
            r = self.make(title=title)
            self.assertEqual(r.status_code, 400)
            self.assertIn("title", r.data)
        r = self.client.post(URL, {"description": "x"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_invalid_deadline_and_priority(self):
        self.assertEqual(self.make(deadline="31/12/2030").status_code, 400)
        self.assertEqual(self.make(priority="Urgent").status_code, 400)

    def test_list_filter(self):
        a = self.make(title="A").data
        self.make(title="B")
        self.client.patch(f"{URL}{a['id']}/", {"status": "Completed"}, format="json")
        self.assertEqual(len(self.client.get(URL).data), 2)
        self.assertEqual([t["title"] for t in self.client.get(URL + "?status=pending").data], ["B"])
        self.assertEqual([t["title"] for t in self.client.get(URL + "?status=completed").data], ["A"])
        self.assertEqual(self.client.get(URL + "?status=bogus").status_code, 400)

    def test_search_and_priority(self):
        self.make(title="Buy milk", description="", priority="Low")
        self.make(title="Tax return", description="file with accountant", priority="High")
        self.assertEqual(len(self.client.get(URL + "?q=milk").data), 1)
        self.assertEqual(len(self.client.get(URL + "?q=accountant").data), 1)
        self.assertEqual(len(self.client.get(URL + "?priority=High").data), 1)

    def test_due_date_filter(self):
        self.make(title="A", deadline="2030-05-01")
        self.make(title="B", deadline="2030-06-01")
        self.assertEqual([t["title"] for t in self.client.get(URL + "?due=2030-05-01").data], ["A"])
        self.assertEqual(self.client.get(URL + "?due=nope").status_code, 400)

    def test_put_update(self):
        t = self.make().data
        r = self.client.put(f"{URL}{t['id']}/", {"title": "New", "description": "", "deadline": None,
                                                 "priority": "Low"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["title"], "New")
        self.assertIsNone(r.data["deadline"])
        self.assertEqual(self.client.put(f"{URL}{t['id']}/", {"title": ""}, format="json").status_code, 400)

    def test_patch_status(self):
        t = self.make().data
        r = self.client.patch(f"{URL}{t['id']}/", {"status": "Completed"}, format="json")
        self.assertEqual(r.data["status"], "Completed")
        self.assertEqual(self.client.patch(f"{URL}{t['id']}/", {"status": "Done"}, format="json").status_code, 400)

    def test_delete(self):
        t = self.make().data
        self.assertEqual(self.client.delete(f"{URL}{t['id']}/").status_code, 204)
        self.assertEqual(self.client.get(f"{URL}{t['id']}/").status_code, 404)
        self.assertEqual(self.client.delete(f"{URL}{t['id']}/").status_code, 404)

    def test_persisted_in_db(self):
        self.make(title="Persist me")
        self.assertEqual(Task.objects.get().title, "Persist me")

    def test_unknown_api_route(self):
        self.assertEqual(self.client.get("/api/nope/").status_code, 404)
