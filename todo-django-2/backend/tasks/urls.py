from rest_framework.routers import DefaultRouter

from .views import TaskViewSet

router = DefaultRouter()
router.include_root_view = False
router.register("tasks", TaskViewSet, basename="task")
urlpatterns = router.urls
