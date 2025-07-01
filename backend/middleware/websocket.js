
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class WebSocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        connectedAt: new Date()
      });

      // Join user to their role-based rooms
      socket.join(`role:${socket.userRole}`);
      socket.join(`user:${socket.userId}`);

      // Handle custom events
      socket.on('join-entity-room', (data) => {
        const { entityType, entityId } = data;
        if (this.canAccessEntity(socket.user, entityType, entityId)) {
          socket.join(`${entityType}:${entityId}`);
        }
      });

      socket.on('leave-entity-room', (data) => {
        const { entityType, entityId } = data;
        socket.leave(`${entityType}:${entityId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  canAccessEntity(user, entityType, entityId) {
    // Implement role-based access control for real-time updates
    if (user.role === 'super_admin') return true;
    
    // Add specific logic based on entity type and user role
    switch (entityType) {
      case 'claim':
      case 'policy':
      case 'quotation':
        return user.role === 'manager' || user.role === 'agent';
      default:
        return false;
    }
  }

  // Emit events to specific users or rooms
  emitToUser(userId, event, data) {
    if (this.connectedUsers.has(userId)) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  emitToEntity(entityType, entityId, event, data) {
    this.io.to(`${entityType}:${entityId}`).emit(event, data);
  }

  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }
}

module.exports = new WebSocketManager();
