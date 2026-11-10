import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { robotService } from '../services/robotService';
import { SOCIETY_INFO, ALERT_ZONES, INITIAL_COMMUNITY_FEED } from '../data/keralaSocietyData';
import { voiceService } from '../services/voiceService';

const PawPatrolContext = createContext(null);

export function PawPatrolProvider({ children }) {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'dogs' | 'history' | 'alerts' | 'community' | 'settings'

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pawpatrol_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pawpatrol_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Robot Telemetry State
  const [robotState, setRobotState] = useState(() => robotService.state);
  const [dogs, setDogs] = useState(() => robotService.getDogsWithProximity());
  const [selectedDog, setSelectedDog] = useState(null);
  const [hoveredDogId, setHoveredDogId] = useState(null);

  // Map Configuration
  const [tileLayer, setTileLayer] = useState('street'); // 'street' | 'satellite' | 'dark'
  const [radius, setRadius] = useState(150); // meters
  const [isDrawingWaypoints, setIsDrawingWaypoints] = useState(false);
  const [customWaypoints, setCustomWaypoints] = useState([]);
  const mapInstanceRef = useRef(null);

  // Alert & Incident System
  const [alertZones, setAlertZones] = useState(ALERT_ZONES);
  const [currentLocationName, setCurrentLocationName] = useState('Palm Meadows Enclave, Kochi, Kerala');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRelocatingMode, setIsRelocatingMode] = useState(false);
  const [toasts, setToasts] = useState([
    {
      id: 'welcome-toast',
      type: 'info',
      title: 'PawPatrol System Online',
      message: 'Sparky is active on Sector A (Palm Meadows Enclave, Kakkanad).',
      timestamp: Date.now()
    }
  ]);

  // Modals & Panels
  const [isLostDogRadarOpen, setIsLostDogRadarOpen] = useState(false);
  const [isSafeWalkModalOpen, setIsSafeWalkModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return localStorage.getItem('pawpatrol_onboarded') !== 'true';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'known' | 'stray' | 'unknown' | 'nearby'

  // Community Feed
  const [communityPosts, setCommunityPosts] = useState(INITIAL_COMMUNITY_FEED);

  // Time Scrubber (Heatmap timeline hour, 6 to 22)
  const [scrubberHour, setScrubberHour] = useState(11);
  const [isScrubberPlaying, setIsScrubberPlaying] = useState(false);

  // Sound effects enabled
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subscribe to Robot Service telemetry
  useEffect(() => {
    const unsubTelemetry = robotService.on('telemetry', (incoming) => {
      setRobotState({ ...incoming });
      if (incoming.dogs) {
        setDogs([...incoming.dogs]);
      }
    });

    const unsubAlert = robotService.on('alert', (alert) => {
      addToast(alert);
    });

    const unsubDogDetected = robotService.on('dogDetected', (dog) => {
      addToast({
        id: 'detect-' + dog.id + '-' + Date.now(),
        type: 'success',
        title: `Canine Sighted: ${dog.name}`,
        message: `Identified ${dog.breed} (${Math.round(dog.confidence * 100)}% match).`
      });
    });

    return () => {
      unsubTelemetry();
      unsubAlert();
      unsubDogDetected();
    };
  }, []);

  // Update detection radius on robot
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    robotService.setDetectionRadius(newRadius);
  };

  // Toast Helper
  const addToast = (toast) => {
    const item = {
      ...toast,
      id: toast.id || 'toast-' + Date.now(),
      timestamp: Date.now()
    };
    setToasts(prev => [item, ...prev].slice(0, 5));

    // Auto-dismiss after 6s
    setTimeout(() => {
      dismissToast(item.id);
    }, 6000);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fly Map Camera
  const flyTo = (lat, lng, zoom = 18) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.2
      });
    }
  };

  const recenterOnRobot = () => {
    if (robotState.lat && robotState.lng) {
      flyTo(robotState.lat, robotState.lng, 18);
    }
  };

  const flyToDog = (dogId) => {
    const target = dogs.find(d => d.id === dogId);
    if (target) {
      setSelectedDog(target);
      flyTo(target.lat, target.lng, 19);
    }
  };

  // Voice Command Listener Integration
  useEffect(() => {
    const unsubVoice = voiceService.onResult((action) => {
      console.log('Voice action received:', action);
      if (action.type === 'FIND_DOG') {
        const query = action.dogName.toLowerCase();
        const found = dogs.find(d => d.name.toLowerCase().includes(query) || d.breed.toLowerCase().includes(query));
        if (found) {
          flyToDog(found.id);
          voiceService.speak(`Found ${found.name}, a ${found.breed}, ${found.distanceFromRobot} meters from Sparky near ${found.favoriteSpots?.[0] || 'the area'}.`);
          addToast({
            type: 'info',
            title: `Voice Match: ${found.name}`,
            message: `Navigated to ${found.name}'s live location.`
          });
        } else {
          voiceService.speak(`I couldn't locate any dog named ${action.dogName} in the society.`);
          addToast({
            type: 'warning',
            title: 'Dog Not Found',
            message: `No active match for "${action.dogName}".`
          });
        }
      } else if (action.type === 'RETURN_BASE') {
        robotService.returnToBase();
        voiceService.speak('Sparky is returning to North Dock Alpha Solar Hub.');
      } else if (action.type === 'START_PATROL') {
        robotService.startPatrol();
        voiceService.speak('Patrol routine resumed. Roaming society avenues.');
      } else if (action.type === 'PAUSE_PATROL') {
        robotService.pausePatrol();
        voiceService.speak('Robot paused.');
      } else if (action.type === 'STATUS_REPORT') {
        const msg = `Sparky battery is at ${Math.round(robotState.battery)} percent. Speed ${robotState.speed} km/h. Mode is ${robotState.mode}. ${dogs.length} dogs tracked today.`;
        voiceService.speak(msg);
        addToast({ type: 'info', title: 'Status Report', message: msg });
      } else if (action.type === 'SAFE_WALK') {
        setIsSafeWalkModalOpen(true);
        voiceService.speak('Opening Safe Walk escort controls.');
      } else if (action.type === 'LOST_DOG') {
        setIsLostDogRadarOpen(true);
        voiceService.speak('Lost Dog Radar activated. Please enter the missing pet details.');
      }
    });

    return () => unsubVoice();
  }, [dogs, robotState]);

  // Location Relocation Helper
  const relocateRobotTo = (lat, lng, name = "Custom Location") => {
    robotService.relocateRobot(lat, lng, name);
    setCurrentLocationName(name);
    flyTo(lat, lng, 18);
    setIsRelocatingMode(false);
    setIsLocationModalOpen(false);
    addToast({
      type: 'success',
      title: 'Robot AI Relocated',
      message: `Sparky teleported to ${name} (${lat.toFixed(4)}, ${lng.toFixed(4)}). Canine sensors re-indexed.`
    });
  };

  // Map Click Handler (Supports Waypoint Drawing & Map-Click Relocation)
  const handleMapClick = (latlng) => {
    if (isRelocatingMode) {
      relocateRobotTo(latlng.lat, latlng.lng, `Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
    } else if (isDrawingWaypoints) {
      setCustomWaypoints(prev => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
    }
  };

  const applyCustomWaypoints = () => {
    if (customWaypoints.length >= 2) {
      robotService.setCustomWaypoints(customWaypoints);
      setIsDrawingWaypoints(false);
      addToast({
        type: 'success',
        title: 'New Patrol Route Active',
        message: `Robot assigned to follow ${customWaypoints.length} custom checkpoints.`
      });
    }
  };

  const cancelCustomWaypoints = () => {
    setIsDrawingWaypoints(false);
    setCustomWaypoints([]);
  };

  const resetToDefaultWaypoints = () => {
    robotService.setCustomWaypoints(null);
    setCustomWaypoints([]);
    addToast({
      type: 'info',
      title: 'Route Reset',
      message: 'Restored standard Palm Meadows perimeter patrol route.'
    });
  };

  // Dog Passport Claiming
  const handleClaimDog = (dogId, ownerDetails) => {
    const success = robotService.claimDog(dogId, ownerDetails);
    if (success) {
      addToast({
        type: 'success',
        title: 'Dog Claimed & Registered!',
        message: `${ownerDetails.name} verified as owner with ID ${ownerDetails.ownerId}.`
      });
      // Update local selected dog
      const updated = robotService.dogs.find(d => d.id === dogId);
      if (updated) setSelectedDog({ ...updated });
    }
    return success;
  };

  // Community Feed Interaction
  const handleLikePost = (postId) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleAddPost = (post) => {
    const newPost = {
      ...post,
      id: 'post-' + Date.now(),
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
      comments: []
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    addToast({
      type: 'success',
      title: 'Community Post Published',
      message: 'Your update is now live on the Palm Meadows feed.'
    });
  };

  // Onboarding Complete
  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('pawpatrol_onboarded', 'true');
  };

  return (
    <PawPatrolContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        robotState,
        dogs,
        selectedDog,
        setSelectedDog,
        hoveredDogId,
        setHoveredDogId,
        tileLayer,
        setTileLayer,
        radius,
        handleRadiusChange,
        mapInstanceRef,
        flyTo,
        recenterOnRobot,
        flyToDog,
        isDrawingWaypoints,
        setIsDrawingWaypoints,
        customWaypoints,
        handleMapClick,
        applyCustomWaypoints,
        cancelCustomWaypoints,
        resetToDefaultWaypoints,
        alertZones,
        setAlertZones,
        toasts,
        addToast,
        dismissToast,
        isLostDogRadarOpen,
        setIsLostDogRadarOpen,
        isSafeWalkModalOpen,
        setIsSafeWalkModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isRelocatingMode,
        setIsRelocatingMode,
        currentLocationName,
        relocateRobotTo,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        communityPosts,
        handleLikePost,
        handleAddPost,
        handleClaimDog,
        scrubberHour,
        setScrubberHour,
        isScrubberPlaying,
        setIsScrubberPlaying,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </PawPatrolContext.Provider>
  );
}

export function usePawPatrol() {
  const context = useContext(PawPatrolContext);
  if (!context) {
    throw new Error('usePawPatrol must be used within a PawPatrolProvider');
  }
  return context;
}

