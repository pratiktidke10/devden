
# Serializers convert Django model instances to JSON (and back).
# Think of them as the bridge between your Python models and the API.
# Every model that the frontend needs gets its own serializer.

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Topic, Room, Message


# ── USER SERIALIZERS ──────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    # ModelSerializer automatically generates fields from the model.
    # We just specify which fields to include.
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'email', 'bio', 'avatar']


class RegisterSerializer(serializers.ModelSerializer):
    # Extra field for password confirmation — not on the model,
    # just for validation. write_only=True means it appears in
    # input but never in output (response JSON).
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'username', 'email', 'password', 'password2']

    def validate(self, attrs):
        # Cross-field validation — check both passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        # Remove password2 before creating — it's not a model field
        validated_data.pop('password2')

        # create_user hashes the password properly using Django's
        # built-in password hashing — never store plain text passwords
        user = User.objects.create_user(
            name=validated_data['name'],
            username=validated_data['username'].lower(),
            email=validated_data['email'].lower(),
            password=validated_data['password'],
        )
        return user


# ── TOPIC SERIALIZER ──────────────────────────────────────────

class TopicSerializer(serializers.ModelSerializer):
    # room_count is a computed field — it doesn't exist on the model.
    # SerializerMethodField lets us add custom computed values.
    # The method must be named get_<field_name>.
    room_count = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'name', 'room_count']

    def get_room_count(self, obj):
        # obj is the Topic instance being serialized
        return obj.room_set.count()


# ── MESSAGE SERIALIZER ────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    # Nested serializer — instead of returning just user_id,
    # we return the full user object { id, name, username, avatar }
    # read_only=True means this field is only for output, not input
    user = UserSerializer(read_only=True)

    # room is a nested object too but we only need id and name
    room = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'user', 'room', 'body', 'created', 'updated']

    def get_room(self, obj):
        return {
            'id': obj.room.id,
            'name': obj.room.name,
            'topic': {'name': obj.room.topic.name} if obj.room.topic else None
        }


# ── ROOM SERIALIZERS ──────────────────────────────────────────

class RoomSerializer(serializers.ModelSerializer):
    # Nested host — returns full user object
    host = UserSerializer(read_only=True)

    # Nested topic — returns full topic object
    topic = TopicSerializer(read_only=True)

    # topic_name is write-only — frontend sends just the topic name string
    # We use this in create/update to find or create the topic
    topic_name = serializers.CharField(write_only=True, required=True)

    # Computed fields
    participants_count = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'host', 'topic', 'topic_name',
            'name', 'description',
            'participants_count', 'messages_count',
            'updated', 'created'
        ]

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_messages_count(self, obj):
        return obj.message_set.count()

    def create(self, validated_data):
        # Pop topic_name — handle it separately
        topic_name = validated_data.pop('topic_name')

        # get_or_create — if topic exists use it, if not create it
        # This is the same logic from the old Django view
        topic, created = Topic.objects.get_or_create(
            name__iexact=topic_name,  # case-insensitive match
            defaults={'name': topic_name}
        )

        # host comes from the request user in the view
        room = Room.objects.create(topic=topic, **validated_data)
        return room

    def update(self, instance, validated_data):
        topic_name = validated_data.pop('topic_name', None)

        if topic_name:
            topic, created = Topic.objects.get_or_create(
                name__iexact=topic_name,
                defaults={'name': topic_name}
            )
            instance.topic = topic

        # Update remaining fields
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance


class RoomDetailSerializer(RoomSerializer):
    # Extended serializer for room detail page
    # Includes full messages and participants lists
    messages = serializers.SerializerMethodField()
    participants = UserSerializer(many=True, read_only=True)

    class Meta(RoomSerializer.Meta):
        fields = RoomSerializer.Meta.fields + ['messages', 'participants']

    def get_messages(self, obj):
        # Return messages in chronological order for the chat view
        # (oldest first — newest at bottom like a chat)
        messages = obj.message_set.all().order_by('created')
        return MessageSerializer(messages, many=True).data