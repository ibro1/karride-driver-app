import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface RouteMonitorProps {
    rideId: number;
}

interface DeviationStatus {
    isDeviating: boolean;
    distance: number;
    severity: 'low' | 'medium' | 'high';
    alertLevel: number;
}

const RouteMonitor: React.FC<RouteMonitorProps> = ({ rideId }) => {
    const [deviation, setDeviation] = useState<DeviationStatus | null>(null);
    const locationSubscription = React.useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        startLocationTracking();
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSubscription.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 10 },
            async (location) => {
                await checkRouteDeviation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        );
    };

    const checkRouteDeviation = async (coords: { latitude: number; longitude: number }) => {
        try {
            const response = await fetch(`/(api)/ride/${rideId}/route-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverLat: coords.latitude,
                    driverLng: coords.longitude,
                    timestamp: Date.now()
                })
            });
            const data = await response.json();
            if (data) setDeviation(data);
        } catch (error) {
            console.error('Route check failed:', error);
        }
    };

    const getStatusColor = () => {
        if (!deviation?.isDeviating) return '#22C55E';
        switch (deviation.severity) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#3B82F6';
            default: return '#22C55E';
        }
    };

    if (!deviation?.isDeviating) return null;

    return (
        <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
            <Ionicons name="warning" size={24} color="white" />
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {deviation.alertLevel >= 2 ? '⚠️ Return to Route' : 'Off Route'}
                </Text>
                <Text style={styles.message}>
                    {Math.round(deviation.distance)}m from planned route
                </Text>
            </View>
            {deviation.alertLevel >= 2 && (
                <TouchableOpacity style={styles.navButton}>
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.navText}>Navigate</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    textContainer: {
        flex: 1,
        marginLeft: 12
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'PlusJakartaSans-Bold'
    },
    message: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        marginTop: 2,
        fontFamily: 'PlusJakartaSans-Regular'
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4
    },
    navText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans-SemiBold'
    }
});

export default RouteMonitor;