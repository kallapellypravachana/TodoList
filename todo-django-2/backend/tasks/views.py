from django.db.models import Count, F, Q
from django.utils.dateparse import parse_date
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(ModelViewSet):
    """
    GET    /api/tasks/?status=&priority=&q=&due=YYYY-MM-DD
    POST   /api/tasks/
    GET    /api/tasks/<id>/
    PUT    /api/tasks/<id>/     full update
    PATCH  /api/tasks/<id>/     partial update (e.g. toggle status)
    DELETE /api/tasks/<id>/
    GET    /api/tasks/stats/
    """
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.all()
        if self.action != "list":
            return qs
        p = self.request.query_params

        status = p.get("status", "all")
        if status.lower() != "all":
            if status.capitalize() not in Task.Status.values:
                raise ValidationError({"status": "Invalid status filter."})
            qs = qs.filter(status=status.capitalize())

        priority = p.get("priority", "all")
        if priority.lower() != "all":
            if priority.capitalize() not in Task.Priority.values:
                raise ValidationError({"priority": "Invalid priority filter."})
            qs = qs.filter(priority=priority.capitalize())

        q = p.get("q", "").strip()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))

        due = p.get("due", "").strip()
        if due:
            due_date = parse_date(due)
            if due_date is None:
                raise ValidationError({"due": "Due date must be a valid date (YYYY-MM-DD)."})
            qs = qs.filter(deadline=due_date)

        # Pending first, nearest deadline first (none last), newest first
        return qs.order_by("-status", F("deadline").asc(nulls_last=True), "-id")

    @action(detail=False, methods=["get"])
    def stats(self, request):
        return Response(Task.objects.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status="Pending")),
            completed=Count("id", filter=Q(status="Completed")),
        ))
