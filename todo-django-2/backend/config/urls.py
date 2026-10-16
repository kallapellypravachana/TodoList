from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.urls import include, path, re_path


def spa(_request):
    """Serve the built React app for any non-API route."""
    index = settings.FRONTEND_DIST / "index.html"
    if index.exists():
        return HttpResponse(index.read_text(encoding="utf-8"), content_type="text/html")
    return JsonResponse({"detail": "Frontend not built. Run `npm run build` in /frontend, "
                                   "or use `npm run dev` during development."}, status=404)


urlpatterns = [
    path("api/", include("tasks.urls")),
    re_path(r"^(?!api/).*$", spa),
]
