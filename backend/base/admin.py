from django.contrib import admin
from .models import User, Topic, Room, Message


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'username', 'date_joined']
    search_fields = ['email', 'name', 'username']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'host', 'topic', 'created']
    search_fields = ['name', 'topic__name']
    list_filter = ['topic']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'created']
    search_fields = ['body', 'user__name']