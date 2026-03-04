import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

export function useMultiplayer(currentUser, onRemoteStateReceived) {
    const userName = currentUser ? currentUser.email : '';
    const [roomId, setRoomId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [mode, setMode] = useState('edit'); // 'edit' or 'view'
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [history, setHistory] = useState([]);

    const peerRef = useRef(null);
    const connectionsRef = useRef({}); // peerId -> conn
    const hostConnRef = useRef(null);
    const stateRef = useRef(null);

    // Refs for current mutable state
    const historyRef = useRef([]);
    const usersRef = useRef([]);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { usersRef.current = onlineUsers; }, [onlineUsers]);

    // Removed setAndSaveName logic since we use Firebase

    const getShareLink = (shareMode) => {
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomId);
        url.searchParams.set('mode', shareMode);
        return url.toString();
    };

    const broadcastAll = useCallback((payload) => {
        Object.values(connectionsRef.current).forEach(conn => {
            if (conn.open) conn.send(payload);
        });
    }, []);

    const broadcastState = useCallback((latestState, actionDescription = 'Update Plan') => {
        stateRef.current = latestState;
        if (connectionStatus !== 'connected') return;

        if (isHost) {
            const histEntry = { id: uuidv4(), timestamp: Date.now(), user: userName || 'Host', action: actionDescription };
            const newHistory = [histEntry, ...historyRef.current].slice(0, 50);
            setHistory(newHistory);

            broadcastAll({
                type: 'SYNC_STATE',
                state: latestState,
                history: newHistory,
                users: usersRef.current
            });
        } else {
            if (mode === 'edit' && hostConnRef.current?.open) {
                hostConnRef.current.send({
                    type: 'REQUEST_SYNC',
                    state: latestState,
                    action: actionDescription,
                    user: userName
                });
            }
        }
    }, [connectionStatus, isHost, mode, userName, broadcastAll]);

    useEffect(() => {
        if (!userName) return;

        const urlParams = new URLSearchParams(window.location.search);
        const roomFromUrl = urlParams.get('room');
        const modeFromUrl = urlParams.get('mode') || 'view';

        setConnectionStatus('connecting');
        const peer = new Peer({ debug: 2, secure: true });
        peerRef.current = peer;

        peer.on('open', (id) => {
            if (!roomFromUrl) {
                setIsHost(true);
                setMode('edit');
                setRoomId(id);
                setConnectionStatus('connected');
                setOnlineUsers([{ id, name: userName, isHost: true }]);

                peer.on('connection', (conn) => {
                    conn.on('data', (data) => {
                        if (data.type === 'HELO') {
                            connectionsRef.current[conn.peer] = conn;
                            setOnlineUsers(prev => {
                                const updated = [...prev, { id: conn.peer, name: data.name, isHost: false, mode: data.mode }];
                                broadcastAll({ type: 'USERS_UPDATE', users: updated });
                                return updated;
                            });

                            conn.send({
                                type: 'SYNC_STATE',
                                state: stateRef.current,
                                history: historyRef.current,
                                // users will be sent via USERS_UPDATE broadcast right above
                            });
                        } else if (data.type === 'REQUEST_SYNC') {
                            const peerInfo = usersRef.current.find(u => u.id === conn.peer);
                            if (peerInfo && peerInfo.mode === 'edit') {
                                const histEntry = { id: uuidv4(), timestamp: Date.now(), user: data.user, action: data.action };
                                const newHistory = [histEntry, ...historyRef.current].slice(0, 50);
                                setHistory(newHistory);
                                onRemoteStateReceived(data.state);
                                stateRef.current = data.state;

                                broadcastAll({
                                    type: 'SYNC_STATE',
                                    state: data.state,
                                    history: newHistory,
                                    users: usersRef.current
                                });
                            }
                        }
                    });

                    conn.on('close', () => {
                        delete connectionsRef.current[conn.peer];
                        setOnlineUsers(prev => {
                            const updated = prev.filter(u => u.id !== conn.peer);
                            broadcastAll({ type: 'USERS_UPDATE', users: updated });
                            return updated;
                        });
                    });
                });

            } else {
                setIsHost(false);
                setMode(modeFromUrl);
                setRoomId(roomFromUrl);

                const conn = peer.connect(roomFromUrl);
                hostConnRef.current = conn;

                conn.on('open', () => {
                    setConnectionStatus('connected');
                    conn.send({ type: 'HELO', name: userName, mode: modeFromUrl });
                });

                conn.on('data', (data) => {
                    if (data.type === 'SYNC_STATE') {
                        if (data.state) {
                            onRemoteStateReceived(data.state);
                            stateRef.current = data.state;
                        }
                        if (data.history) setHistory(data.history);
                        if (data.users) setOnlineUsers(data.users);
                    } else if (data.type === 'USERS_UPDATE') {
                        if (data.users) setOnlineUsers(data.users);
                    }
                });

                conn.on('close', () => setConnectionStatus('disconnected'));
            }
        });

        peer.on('error', () => setConnectionStatus('disconnected'));

        return () => peer.destroy();
    }, [userName]);

    return {
        userName, roomId, isHost, mode, connectionStatus,
        onlineUsers, history,
        broadcastState, getShareLink,
        latestState: stateRef.current
    };
}
