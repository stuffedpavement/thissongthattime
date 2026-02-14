
import { db } from "./db";
import { users, songs, stories } from "@shared/schema";

const sampleUsers = [
  {
    username: "musiclover92",
    email: "musiclover92@example.com",
    displayName: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
  },
  {
    username: "vinylcollector",
    email: "vinylcollector@example.com", 
    displayName: "Marcus Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus"
  },
  {
    username: "melodymaker",
    email: "melodymaker@example.com",
    displayName: "Emma Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
  },
  {
    username: "rhythmrider",
    email: "rhythmrider@example.com",
    displayName: "Jake Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake"
  },
  {
    username: "harmonyhunter",
    email: "harmonyhunter@example.com",
    displayName: "Zoe Williams",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zoe"
  },
  {
    username: "beatkeeper",
    email: "beatkeeper@example.com",
    displayName: "Alex Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
  },
  {
    username: "songbird_87",
    email: "songbird87@example.com",
    displayName: "Maya Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya"
  },
  {
    username: "classicrock",
    email: "classicrock@example.com",
    displayName: "David Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
  }
];

const sampleSongs = [
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    year: 1975,
    genre: "Rock",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
  },
  {
    title: "Hotel California", 
    artist: "Eagles",
    album: "Hotel California",
    year: 1976,
    genre: "Rock",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson", 
    album: "Thriller",
    year: 1982,
    genre: "Pop",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction", 
    year: 1987,
    genre: "Hard Rock",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/5/50/Appetite_for_Destruction.jpg"
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    year: 1991,
    genre: "Grunge",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg"
  },
  {
    title: "Wonderwall",
    artist: "Oasis",
    album: "(What's the Story) Morning Glory?",
    year: 1995,
    genre: "Britpop",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/4/4a/Oasis_-_Morning_Glory.jpg"
  },
  {
    title: "Hey Ya!",
    artist: "OutKast",
    album: "Speakerboxxx/The Love Below",
    year: 2003,
    genre: "Hip Hop",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/a/a1/OutKast_-_Speakerboxxx-The_Love_Below_CD_cover.jpg"
  },
  {
    title: "Mr. Brightside",
    artist: "The Killers",
    album: "Hot Fuss",
    year: 2004,
    genre: "Alternative Rock",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/7/77/Hot_Fuss.jpg"
  },
  {
    title: "Rolling in the Deep",
    artist: "Adele",
    album: "21",
    year: 2010,
    genre: "Soul",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png"
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    year: 2017,
    genre: "Pop",
    albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2b/Ed_Sheeran_Divide_cover.jpg"
  }
];

const sampleStories = [
  {
    title: "The Road Trip That Changed Everything",
    content: "I was 19, driving cross-country with my best friend after high school graduation. We had been planning this trip for months, saving every penny from our part-time jobs. When 'Bohemian Rhapsody' came on the radio somewhere in the Nevada desert, we both started singing at the top of our lungs. The way the song builds from that gentle piano to the operatic middle section to the final rock crescendo - it perfectly captured how we felt about leaving home and starting our adult lives. Every time I hear those opening piano notes now, I'm back in that beat-up Honda Civic, windows down, feeling infinite possibility stretching out ahead of us like the endless highway.",
    age: "19",
    lifeContext: "Recent high school graduate on a road trip",
    discoveryMoment: "Playing on the radio during a cross-country drive",
    coreMemory: "Singing along with my best friend in the Nevada desert",
    emotionalConnection: "The song's structure mirrored our feelings about transitioning to adulthood",
    tone: "nostalgic",
    authorName: "Sarah Chen"
  },
  {
    title: "Dad's Vinyl Collection",
    content: "After my father passed away, I spent weeks going through his belongings. In the basement, I found his record collection - hundreds of albums carefully organized and preserved. 'Hotel California' was the first one I pulled out, remembering how he used to play it every Sunday morning while making pancakes. As I listened to it on his old turntable, I could almost smell the butter and maple syrup, hear his off-key humming along to the guitar solos. That song became a bridge between us, a way to feel close to him even after he was gone. Now it's part of my Sunday morning routine too.",
    age: "35",
    lifeContext: "Dealing with father's death and sorting through his belongings",
    discoveryMoment: "Found in father's vinyl collection after his passing",
    coreMemory: "Sunday morning pancakes with dad humming along",
    emotionalConnection: "A connection to my deceased father and our shared memories",
    tone: "melancholic",
    authorName: "Marcus Johnson"
  },
  {
    title: "Dancing in My Bedroom",  
    content: "I was 13 and had just gotten my first CD player for my birthday. 'Billie Jean' was the first song I played, and I spent the entire afternoon learning the moonwalk from a VHS tape I'd rented. I practiced for hours in front of my bedroom mirror, sliding across the hardwood floor in my socks. When I finally nailed it, I felt like I could conquer the world. That song taught me that with enough practice and determination, you could master anything - even something as seemingly impossible as gliding backwards while appearing to walk forward.",
    age: "13", 
    lifeContext: "Middle school, just got first CD player",
    discoveryMoment: "First song played on new CD player",
    coreMemory: "Learning to moonwalk in bedroom mirror",
    emotionalConnection: "Lesson about persistence and achieving the impossible",
    tone: "uplifting",
    authorName: "Emma Rodriguez"
  },
  {
    title: "High School Angst Anthem",
    content: "Senior year of high school was rough. I felt misunderstood by everyone - parents, teachers, even most of my friends. Then I heard 'Smells Like Teen Spirit' for the first time at a friend's house, and it was like someone had put my feelings into music. Kurt Cobain's raw vocals and the driving guitar riff perfectly captured my frustration and confusion. I must have played that song a thousand times, air-guitaring alone in my room, finally feeling like someone understood what it was like to be a teenager who didn't fit into any neat category.",
    age: "17",
    lifeContext: "Struggling with identity during senior year of high school", 
    discoveryMoment: "Heard at a friend's house during a difficult period",
    coreMemory: "Air-guitaring alone in bedroom, feeling understood",
    emotionalConnection: "Song articulated teenage angst and feeling misunderstood",
    tone: "cathartic",
    authorName: "Jake Thompson"
  },
  {
    title: "College Radio Revelation",
    content: "I was a sophomore in college, working the late-night shift at our campus radio station. It was 2 AM, and I was feeling homesick and questioning all my life choices. I put on 'Wonderwall' almost randomly from a stack of CDs, and something about Liam Gallagher's voice and those simple, honest lyrics hit me right in the chest. 'Maybe you're gonna be the one that saves me' - in that moment, sitting alone in that tiny broadcast booth, I felt like the song was speaking directly to me, reminding me that someone out there might need to hear what I had to say.",
    age: "19",
    lifeContext: "Sophomore in college, working at campus radio station",
    discoveryMoment: "Playing during late-night radio shift while feeling homesick",
    coreMemory: "Alone in broadcast booth at 2 AM, feeling the lyrics speak to me",
    emotionalConnection: "Song provided comfort during a period of self-doubt",
    tone: "reflective",
    authorName: "Zoe Williams"
  },
  {
    title: "Wedding Dance Floor Magic",
    content: "My sister's wedding reception was winding down when 'Hey Ya!' came on. I was exhausted from a long day of family obligations and small talk, but something about that infectious beat just grabbed me. Before I knew it, I was on the dance floor with my 8-year-old cousin, teaching him how to do the robot while the whole family cheered us on. That song turned what had been a somewhat stuffy formal event into pure joy. It reminded me that sometimes you just need to shake it like a Polaroid picture and let loose.",
    age: "25",
    lifeContext: "At sister's wedding reception, feeling drained from social obligations",
    discoveryMoment: "Came on during wedding reception when energy was low",
    coreMemory: "Dancing with young cousin while family cheered",
    emotionalConnection: "Song transformed formal event into moment of pure joy",
    tone: "joyful",
    authorName: "Alex Kim"
  },
  {
    title: "Late Night Study Sessions",
    content: "Junior year of college was brutal. I was pre-med, working two part-time jobs, and barely sleeping. During those endless nights in the library, 'Mr. Brightside' became my anthem. There was something about that driving rhythm and Brandon Flowers' passionate vocals that kept me going when I wanted to give up. I'd put on my headphones, crank up the volume, and power through another chapter of organic chemistry. That song didn't just get me through college - it taught me that jealousy and determination could be transformed into fuel for achievement.",
    age: "20",
    lifeContext: "Struggling pre-med student working multiple jobs",
    discoveryMoment: "Became study soundtrack during intense college period",
    coreMemory: "Late nights in library using song as motivation",
    emotionalConnection: "Song provided energy and determination during difficult times",
    tone: "determined",
    authorName: "Maya Patel"
  },
  {
    title: "Breakup Recovery Soundtrack",
    content: "After my first serious relationship ended, I was devastated. I thought I'd never feel whole again. Then 'Rolling in the Deep' came on the radio during a particularly low moment, and Adele's powerful voice reminded me that heartbreak could be transformed into strength. I played that song on repeat for weeks, singing along at the top of my lungs in my car, gradually feeling my confidence return. It taught me that sometimes you have to let yourself feel the pain fully before you can rise above it.",
    age: "22",
    lifeContext: "Recovering from first serious breakup",
    discoveryMoment: "Came on radio during a particularly low moment post-breakup",
    coreMemory: "Singing along loudly in car, gradually regaining confidence",
    emotionalConnection: "Song helped transform heartbreak into personal strength",
    tone: "empowering",
    authorName: "David Martinez"
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");
    
    // Insert users
    console.log("👥 Creating sample users...");
    const createdUsers = await db.insert(users).values(sampleUsers).returning();
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Insert songs  
    console.log("🎵 Creating sample songs...");
    const createdSongs = await db.insert(songs).values(sampleSongs).returning();
    console.log(`✅ Created ${createdSongs.length} songs`);
    
    // Insert stories
    console.log("📚 Creating sample stories...");
    const storyInserts = sampleStories.map((story, index) => ({
      ...story,
      userId: createdUsers[index % createdUsers.length].id,
      songId: createdSongs[index].id,
      isPublished: true
    }));
    
    const createdStories = await db.insert(stories).values(storyInserts).returning();
    console.log(`✅ Created ${createdStories.length} stories`);
    
    console.log("🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}
