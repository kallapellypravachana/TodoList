from django.db import models


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "Low"
        MEDIUM = "Medium"
        HIGH = "High"

    class Status(models.TextChoices):
        PENDING = "Pending"
        COMPLETED = "Completed"

    title = models.CharField(max_length=120)
    description = models.TextField(blank=True, default="", max_length=2000)
    deadline = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=6, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=9, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
