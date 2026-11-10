// Palm Meadows Enclave, Kakkanad, Kochi, Kerala, India
export const SOCIETY_INFO = {
  name: "Palm Meadows Residential Enclave",
  locality: "Infopark Road, Kakkanad, Kochi, Kerala 682042",
  center: [10.0095, 76.3638],
  zoom: 17,
  totalVillas: 142,
  registeredDogs: 18,
  activeRobots: 1,
  robotId: "ROBO-DOG-09 (Sparky)",
  baseStation: {
    lat: 10.0085,
    lng: 76.3625,
    name: "North Dock Alpha (Solar Charging Hub)"
  }
};

// Geofence polygon boundary of Palm Meadows Enclave
export const SOCIETY_GEOFENCE = [
  [10.0125, 76.3615],
  [10.0128, 76.3655],
  [10.0110, 76.3672],
  [10.0080, 76.3670],
  [10.0068, 76.3648],
  [10.0070, 76.3618],
  [10.0095, 76.3610],
  [10.0125, 76.3615]
];

// Road network patrol waypoints across the society
export const PATROL_WAYPOINTS = [
  { id: 'wp-1', name: 'Main Security Gate', lat: 10.0082, lng: 76.3620 },
  { id: 'wp-2', name: 'Central Boulevard', lat: 10.0090, lng: 76.3632 },
  { id: 'wp-3', name: 'Central Lawn & Pavilion', lat: 10.0098, lng: 76.3640 },
  { id: 'wp-4', name: 'North Villa Avenue', lat: 10.0112, lng: 76.3635 },
  { id: 'wp-5', name: 'Clubhouse Promenade', lat: 10.0105, lng: 76.3652 },
  { id: 'wp-6', name: 'East Boundary Jogging Track', lat: 10.0092, lng: 76.3660 },
  { id: 'wp-7', name: 'South Garden Walk', lat: 10.0078, lng: 76.3645 },
  { id: 'wp-8', name: 'Dock Return Alley', lat: 10.0084, lng: 76.3627 }
];

// Initial realistic dogs in the society
export const INITIAL_DOGS = [
  {
    id: "dog-1",
    name: "Bruno",
    breed: "Golden Retriever",
    size: "Large",
    category: "known", // known | unknown | stray
    status: "Friendly & Calm",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    confidence: 0.98,
    lat: 10.0099,
    lng: 76.3642,
    lastSeen: "2 mins ago",
    lastSeenTimestamp: Date.now() - 2 * 60 * 1000,
    owner: {
      name: "Mr. Ramesh Menon",
      villa: "Villa 34, Jasmine Block",
      phone: "+91 98470 12345",
      id: "PM-V34",
      registered: true
    },
    collarId: "RF-DOG-992",
    favoriteSpots: ["Central Lawn", "Clubhouse Fountain", "Jasmine Avenue"],
    behaviorNotes: "Very social with kids; loves tennis balls. Fully vaccinated (Rabies + DHPPi 2026).",
    sightingsCount: 142
  },
  {
    id: "dog-2",
    name: "Appu",
    breed: "Indian Pariah (Desi)",
    size: "Medium",
    category: "known",
    status: "Society Community Pet",
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    confidence: 0.96,
    lat: 10.0084,
    lng: 76.3624,
    lastSeen: "5 mins ago",
    lastSeenTimestamp: Date.now() - 5 * 60 * 1000,
    owner: {
      name: "Security Guard Station & Palm Meadows Welfare Assoc.",
      villa: "Main Gate Gatehouse",
      phone: "+91 94471 00222",
      id: "PM-COMM-01",
      registered: true
    },
    collarId: "GREEN-TAG-04",
    favoriteSpots: ["Security Gate Post", "Morning Tea Bench", "North Dock"],
    behaviorNotes: "Gentle protector of the community gate. Sterilized & vaccinated by Kochi MC.",
    sightingsCount: 310
  },
  {
    id: "dog-3",
    name: "Maya",
    breed: "Beagle",
    size: "Medium",
    category: "known",
    status: "Playful / Energetic",
    photo: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80",
    confidence: 0.94,
    lat: 10.0108,
    lng: 76.3648,
    lastSeen: "12 mins ago",
    lastSeenTimestamp: Date.now() - 12 * 60 * 1000,
    owner: {
      name: "Dr. Anjali Nair",
      villa: "Villa 12, Orchid Block",
      phone: "+91 98950 44556",
      id: "PM-V12",
      registered: true
    },
    collarId: "RF-DOG-314",
    favoriteSpots: ["Orchid Circle", "Children Playground", "East Hedge"],
    behaviorNotes: "Scent-hound curiosity; loves sniffing garden edges. Wears pink reflective collar.",
    sightingsCount: 98
  },
  {
    id: "dog-4",
    name: "Shadow",
    breed: "German Shepherd",
    size: "Large",
    category: "known",
    status: "Trained / Alert",
    photo: "https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&w=600&q=80",
    confidence: 0.99,
    lat: 10.0114,
    lng: 76.3632,
    lastSeen: "18 mins ago",
    lastSeenTimestamp: Date.now() - 18 * 60 * 1000,
    owner: {
      name: "Col. Mathew Kurian (Retd.)",
      villa: "Villa 4, Palm Crest",
      phone: "+91 94460 77889",
      id: "PM-V04",
      registered: true
    },
    collarId: "K9-COMMAND-01",
    favoriteSpots: ["North Perimeter Walk", "Villa 4 Porch"],
    behaviorNotes: "Disciplined guard dog, stays on leash during walks. Obedience certified.",
    sightingsCount: 164
  },
  {
    id: "dog-5",
    name: "Tommy",
    breed: "Pomeranian",
    size: "Small",
    category: "known",
    status: "Vocal / High Energy",
    photo: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80",
    confidence: 0.92,
    lat: 10.0091,
    lng: 76.3630,
    lastSeen: "24 mins ago",
    lastSeenTimestamp: Date.now() - 24 * 60 * 1000,
    owner: {
      name: "Mrs. Lakshmi Varma",
      villa: "Flat 204, Royal Palms A",
      phone: "+91 97455 33221",
      id: "PM-F204",
      registered: true
    },
    collarId: "BELL-TAG-11",
    favoriteSpots: ["Lobby Garden", "Central Bench", "Royal Palms Pathway"],
    behaviorNotes: "Barks at electric scooters and squirrels; very loving with familiar faces.",
    sightingsCount: 82
  },
  {
    id: "dog-6",
    name: "Chacko",
    breed: "Labrador Retriever (Chocolate)",
    size: "Large",
    category: "known",
    status: "Gentle Giant",
    photo: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    confidence: 0.97,
    lat: 10.0080,
    lng: 76.3650,
    lastSeen: "35 mins ago",
    lastSeenTimestamp: Date.now() - 35 * 60 * 1000,
    owner: {
      name: "Alex & Sherin Thomas",
      villa: "Villa 28, Lotus Lane",
      phone: "+91 98460 99881",
      id: "PM-V28",
      registered: true
    },
    collarId: "RF-DOG-512",
    favoriteSpots: ["Clubhouse Lawn", "Lotus Lane Cross"],
    behaviorNotes: "Enjoys swimming in community sprinkler; loves belly rubs.",
    sightingsCount: 115
  },
  {
    id: "dog-7",
    name: "Rocky (Unclaimed Stray)",
    breed: "Indian Street Dog (Tan/Black)",
    size: "Medium",
    category: "stray",
    status: "Roaming North Gate",
    photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    confidence: 0.88,
    lat: 10.0121,
    lng: 76.3622,
    lastSeen: "8 mins ago",
    lastSeenTimestamp: Date.now() - 8 * 60 * 1000,
    owner: null,
    collarId: null,
    favoriteSpots: ["North Trash Dispersal Zone", "Outer Perimeter Wall"],
    behaviorNotes: "Cautious stray, observed sniffing near garbage bay. No rabies aggression symptoms. Needs feeder care tag.",
    sightingsCount: 14
  },
  {
    id: "dog-8",
    name: "Biscuit (Visitor / Unregistered)",
    breed: "Cocker Spaniel",
    size: "Medium",
    category: "unknown",
    status: "Possible Visitor Pet",
    photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80",
    confidence: 0.85,
    lat: 10.0102,
    lng: 76.3658,
    lastSeen: "14 mins ago",
    lastSeenTimestamp: Date.now() - 14 * 60 * 1000,
    owner: null,
    collarId: "Blue patterned collar (Unsynced)",
    favoriteSpots: ["Clubhouse Pool Porch", "Tennis Court Walk"],
    behaviorNotes: "Well groomed, clearly a domestic pet without registered QR tag. Appears lost or visiting guest villa.",
    sightingsCount: 3
  },
  {
    id: "dog-9",
    name: "Ruby",
    breed: "Dachshund (Sausage)",
    size: "Small",
    category: "known",
    status: "Curious Explorer",
    photo: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=600&q=80",
    confidence: 0.95,
    lat: 10.0094,
    lng: 76.3654,
    lastSeen: "40 mins ago",
    lastSeenTimestamp: Date.now() - 40 * 60 * 1000,
    owner: {
      name: "Priya & Vivek Nair",
      villa: "Villa 18, Hibiscus Row",
      phone: "+91 97470 55443",
      id: "PM-V18",
      registered: true
    },
    collarId: "RF-DOG-708",
    favoriteSpots: ["Hibiscus Front Garden", "South Gazebo"],
    behaviorNotes: "Very affectionate, likes snoozing under garden sunshades.",
    sightingsCount: 76
  },
  {
    id: "dog-10",
    name: "Simba",
    breed: "Shih Tzu",
    size: "Small",
    category: "known",
    status: "Quiet Pampered Pup",
    photo: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80",
    confidence: 0.93,
    lat: 10.0100,
    lng: 76.3628,
    lastSeen: "52 mins ago",
    lastSeenTimestamp: Date.now() - 52 * 60 * 1000,
    owner: {
      name: "Kavitha Joseph",
      villa: "Flat 4D, Ivory Tower",
      phone: "+91 94473 11880",
      id: "PM-IV4D",
      registered: true
    },
    collarId: "RF-DOG-422",
    favoriteSpots: ["Ivory Tower Lawn", "Morning Joggers Circle"],
    behaviorNotes: "Gentle lapdog, usually escorted with harness and leash.",
    sightingsCount: 65
  }
];

// Aggression / Alert Zones
export const ALERT_ZONES = [
  {
    id: "zone-1",
    name: "North Gate Waste Depot Alley",
    severity: "high", // high | medium | warning
    center: [10.0120, 76.3626],
    radius: 35, // meters
    reason: "Territorial barking between 2 strays reported by morning delivery agent",
    timestamp: "07:15 AM Today",
    safeDetourSuggestion: "Use Central Boulevard -> Clubhouse Walkway instead of North Gate Back Alley.",
    active: true
  },
  {
    id: "zone-2",
    name: "East Perimeter Construction Edge",
    severity: "medium",
    center: [10.0093, 76.3664],
    radius: 28,
    reason: "Loud jackhammer noise causing distress & agitated howling in passing dogs",
    timestamp: "09:30 AM Today",
    safeDetourSuggestion: "Bypass East Fence; divert through Central Park Pavilion.",
    active: true
  }
];

// Historical detection points for the Dog Heatmap Timeline scrubber (06:00 to 22:00)
export const HEATMAP_TIMELINE_DATA = [
  { hour: 6, label: "06:00 AM", count: 4, points: [[10.0083, 76.3622, 0.7], [10.0091, 76.3635, 0.9], [10.0099, 76.3642, 0.8], [10.0112, 76.3633, 0.6]] },
  { hour: 7, label: "07:00 AM", count: 9, points: [[10.0084, 76.3624, 0.9], [10.0090, 76.3630, 0.8], [10.0098, 76.3640, 0.95], [10.0108, 76.3648, 0.9], [10.0114, 76.3632, 0.8], [10.0121, 76.3624, 0.85], [10.0094, 76.3654, 0.7], [10.0080, 76.3650, 0.8], [10.0100, 76.3628, 0.7]] },
  { hour: 8, label: "08:00 AM", count: 12, points: [[10.0098, 76.3640, 1.0], [10.0099, 76.3642, 0.95], [10.0090, 76.3632, 0.9], [10.0084, 76.3624, 0.8], [10.0105, 76.3652, 0.9], [10.0108, 76.3648, 0.85], [10.0114, 76.3632, 0.9], [10.0092, 76.3660, 0.7], [10.0078, 76.3645, 0.8], [10.0080, 76.3650, 0.85], [10.0091, 76.3630, 0.8], [10.0102, 76.3658, 0.7]] },
  { hour: 9, label: "09:00 AM", count: 8, points: [[10.0098, 76.3640, 0.9], [10.0085, 76.3625, 0.7], [10.0105, 76.3652, 0.8], [10.0092, 76.3664, 0.9], [10.0114, 76.3632, 0.7], [10.0094, 76.3654, 0.8], [10.0080, 76.3650, 0.8], [10.0121, 76.3622, 0.6]] },
  { hour: 10, label: "10:00 AM", count: 6, points: [[10.0099, 76.3642, 0.9], [10.0084, 76.3624, 0.9], [10.0108, 76.3648, 0.8], [10.0114, 76.3632, 0.7], [10.0091, 76.3630, 0.7], [10.0102, 76.3658, 0.8]] },
  { hour: 11, label: "11:00 AM (Now)", count: 7, points: [[10.0099, 76.3642, 0.98], [10.0084, 76.3624, 0.96], [10.0108, 76.3648, 0.94], [10.0114, 76.3632, 0.99], [10.0091, 76.3630, 0.92], [10.0121, 76.3622, 0.88], [10.0102, 76.3658, 0.85]] },
  { hour: 13, label: "01:00 PM", count: 4, points: [[10.0085, 76.3625, 0.7], [10.0099, 76.3642, 0.8], [10.0084, 76.3624, 0.9], [10.0114, 76.3632, 0.7]] },
  { hour: 16, label: "04:00 PM", count: 8, points: [[10.0098, 76.3640, 0.9], [10.0105, 76.3652, 0.9], [10.0090, 76.3632, 0.8], [10.0084, 76.3624, 0.9], [10.0108, 76.3648, 0.85], [10.0094, 76.3654, 0.8], [10.0080, 76.3650, 0.85], [10.0091, 76.3630, 0.8]] },
  { hour: 18, label: "06:00 PM (Evening Peak)", count: 14, points: [[10.0098, 76.3640, 1.0], [10.0099, 76.3642, 1.0], [10.0090, 76.3632, 0.95], [10.0105, 76.3652, 0.9], [10.0108, 76.3648, 0.9], [10.0114, 76.3632, 0.95], [10.0084, 76.3624, 0.9], [10.0094, 76.3654, 0.85], [10.0080, 76.3650, 0.9], [10.0091, 76.3630, 0.9], [10.0092, 76.3660, 0.8], [10.0078, 76.3645, 0.85], [10.0100, 76.3628, 0.8], [10.0121, 76.3622, 0.7]] },
  { hour: 20, label: "08:00 PM", count: 6, points: [[10.0098, 76.3640, 0.8], [10.0084, 76.3624, 0.95], [10.0090, 76.3632, 0.8], [10.0114, 76.3632, 0.8], [10.0080, 76.3650, 0.75], [10.0121, 76.3622, 0.8]] }
];

// Initial Community Feed
export const INITIAL_COMMUNITY_FEED = [
  {
    id: "post-1",
    author: "Mr. Ramesh Menon (Villa 34)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Resident",
    timeAgo: "25 mins ago",
    badge: "Pet Parent",
    content: "Big thanks to Sparky (PawBot-09) for locating Bruno near Central Lawn when he chased a tennis ball under the hedges! The live detection alert on my phone popped up right away. 🐾❤️",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    likes: 18,
    isLiked: false,
    comments: [
      { id: "c1", author: "Dr. Anjali Nair", text: "Bruno was having a blast! Maya saw him too." },
      { id: "c2", author: "Security Desk", text: "Glad Bruno is safe back home!" }
    ]
  },
  {
    id: "post-2",
    author: "Alex Thomas (Villa 28)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Resident",
    timeAgo: "2 hours ago",
    badge: "Community Watch",
    content: "Notice: There is an unregistered Cocker Spaniel (tan coat, blue collar) spotted near the clubhouse pool deck. Looks like someone's visiting dog. Please check the Dog Passport section to claim!",
    photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
    likes: 12,
    isLiked: false,
    comments: [
      { id: "c3", author: "Priya Nair", text: "Shared this in the Palm Meadows WhatsApp group." }
    ]
  },
  {
    id: "post-3",
    author: "PawPatrol Auto-Log",
    avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&q=80",
    role: "AI Robot Dispatch",
    timeAgo: "3 hours ago",
    badge: "System Alert",
    content: "🛡️ Safe Escort Completed: Accompanied Mrs. Varma and Tommy (Pomeranian) from Flat 204 to Central Park Pavilion, safely circumnavigating Alert Zone #1 near North Gate. All quiet.",
    photo: null,
    likes: 24,
    isLiked: true,
    comments: []
  }
];

