module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);

        // Join User-Specific Room
        // Frontend must emit 'join' with their User ID after login
        socket.on('join', (userId) => {
            if (userId) {
                const roomName = `user_${userId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room: ${roomName}`);

                // Optional: Welcome notification
                io.to(roomName).emit('notification', {
                    title: 'Connected',
                    message: 'You are now connected to real-time updates.',
                    type: 'info'
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected:', socket.id);
        });
    });
};
