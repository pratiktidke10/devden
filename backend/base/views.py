# base/views.py
# DRF API views — each view is an API endpoint that returns JSON.
# We use APIView for full control over request/response.
# Every view handles authentication, permissions, and errors properly.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Topic, Room, Message
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    TopicSerializer,
    RoomSerializer,
    RoomDetailSerializer,
    MessageSerializer,
)



class SilentJWTAuthentication(JWTAuthentication):
    # This custom class extends the standard JWT authentication.
    # The difference: if the token is invalid or expired,
    # instead of raising an error (which blocks public endpoints),
    # it returns None — treating the user as anonymous.
    # Valid tokens still authenticate normally.
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            return None
        

# ── HELPER ───────────────────────────────────────────────────
def get_tokens_for_user(user):
    # Generate JWT access + refresh tokens for a user.
    # Called after login and registration.
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ── AUTH VIEWS ───────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                **tokens,
                'user': UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    # Blacklist the refresh token on logout
    # This invalidates the token server-side
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'detail': 'Logged out successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


# ── ROOM VIEWS ───────────────────────────────────────────────

class RoomListView(APIView):
    # Explicitly set authentication classes
    # This way expired tokens don't block public GET requests
    authentication_classes = [SilentJWTAuthentication]  
    permission_classes = []

    def get(self, request):
        q = request.GET.get('q', '')
        topic = request.GET.get('topic', '')

        rooms = Room.objects.filter(
            Q(topic__name__icontains=q) |
            Q(name__icontains=q) |
            Q(description__icontains=q)
        )

        if topic:
            rooms = rooms.filter(topic__name__iexact=topic)

        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Manually check auth for POST only
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save(host=request.user)
            return Response(
                RoomSerializer(room).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomDetailView(APIView):
    authentication_classes = [SilentJWTAuthentication]
    permission_classes = []

    def get_object(self, pk):
        try:
            return Room.objects.get(id=pk)
        except Room.DoesNotExist:
            return None

    def get(self, request, pk):
        room = self.get_object(pk)
        if not room:
            return Response(
                {'detail': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = RoomDetailSerializer(room)
        return Response(serializer.data)

    def put(self, request, pk):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        room = self.get_object(pk)
        if not room:
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.user != room.host:
            return Response({'detail': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            room = serializer.save()
            return Response(RoomSerializer(room).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        room = self.get_object(pk)
        if not room:
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.user != room.host:
            return Response({'detail': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)
        room.delete()
        return Response({'detail': 'Room deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ── MESSAGE VIEWS ─────────────────────────────────────────────

class MessageCreateView(APIView):
    # POST /api/rooms/<id>/messages/ — post a message in a room
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            room = Room.objects.get(id=pk)
        except Room.DoesNotExist:
            return Response(
                {'detail': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        body = request.data.get('body', '').strip()
        if not body:
            return Response(
                {'detail': 'Message body cannot be empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the message
        message = Message.objects.create(
            user=request.user,
            room=room,
            body=body
        )

        # Add user to room participants automatically
        room.participants.add(request.user)

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )


class MessageDeleteView(APIView):
    # DELETE /api/messages/<id>/ — delete a message (owner only)
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            message = Message.objects.get(id=pk)
        except Message.DoesNotExist:
            return Response(
                {'detail': 'Message not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only message owner can delete
        if request.user != message.user:
            return Response(
                {'detail': 'You cannot delete this message.'},
                status=status.HTTP_403_FORBIDDEN
            )

        message.delete()
        return Response(
            {'detail': 'Message deleted.'},
            status=status.HTTP_204_NO_CONTENT
        )


# ── USER VIEWS ───────────────────────────────────────────────

class UserProfileView(APIView):
    authentication_classes = [SilentJWTAuthentication]
    permission_classes = []

    def get(self, request, pk):
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        rooms = Room.objects.filter(host=user)
        messages = Message.objects.filter(user=user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'rooms': RoomSerializer(rooms, many=True, context={'request': request}).data,
            'messages': MessageSerializer(messages, many=True, context={'request': request}).data,
        })


class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if request.user.id != int(pk):
            return Response(
                {'detail': 'You cannot edit another user\'s profile.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user = request.user
        user.name = request.data.get('name', user.name)
        user.username = request.data.get('username', user.username).lower()
        user.bio = request.data.get('bio', user.bio)

        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']

        user.save()
        return Response(
            UserSerializer(user, context={'request': request}).data
        )


# ── TOPIC VIEWS ──────────────────────────────────────────────

class TopicListView(APIView):
    authentication_classes = [SilentJWTAuthentication]
    permission_classes = []

    def get(self, request):
        q = request.GET.get('q', '')
        topics = Topic.objects.filter(name__icontains=q)
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)


# ── ACTIVITY VIEW ─────────────────────────────────────────────

class ActivityView(APIView):
    authentication_classes = [SilentJWTAuthentication]
    permission_classes = []

    def get(self, request):
        messages = Message.objects.all().order_by('-created')[:20]
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)