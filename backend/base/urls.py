from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),

    # Rooms
    path('rooms/', views.RoomListView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', views.RoomDetailView.as_view(), name='room-detail'),

    # Messages
    path('rooms/<int:pk>/messages/', views.MessageCreateView.as_view(), name='message-create'),
    path('messages/<int:pk>/', views.MessageDeleteView.as_view(), name='message-delete'),

    # Users
    path('users/<int:pk>/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/<int:pk>/update/', views.UserUpdateView.as_view(), name='user-update'),

    # Topics
    path('topics/', views.TopicListView.as_view(), name='topic-list'),

    # Activity
    path('activity/', views.ActivityView.as_view(), name='activity'),
]