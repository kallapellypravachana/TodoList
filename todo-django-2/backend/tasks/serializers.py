from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=120,
        error_messages={
            "blank": "Title is required and cannot be empty.",
            "required": "Title is required and cannot be empty.",
            "null": "Title is required and cannot be empty.",
            "max_length": "Title must be 120 characters or fewer.",
        },
    )

    class Meta:
        model = Task
        fields = ["id", "title", "description", "deadline", "priority", "status",
                  "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "description": {"required": False, "allow_blank": True, "max_length": 2000},
            "deadline": {"required": False, "allow_null": True},
        }
