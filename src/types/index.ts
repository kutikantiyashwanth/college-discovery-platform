export interface Course {
  name: string;
  duration: string;
  fees: number;
  seats: number;
}

export interface PlacementStat {
  year: number;
  avgPackage: number;
  highestPackage: number;
  placementRate: number;
  topRecruiters: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  location: string;
  city: string;
  state: string;
  type: 'Government' | 'Private' | 'Deemed';
  rating: number;
  totalReviews: number;
  fees: number;
  established: number;
  logo: string;
  coverColor: string;
  image: string;        // campus hero image URL
  logoUrl?: string;     // official logo URL (optional)
  accreditation: string;
  ranking: { nirf: number; qs?: number };
  overview: string;
  facilities: string[];
  courses: Course[];
  placements: PlacementStat;
  reviews: Review[];
  exams: string[];
  tags: string[];
}

export type SortOption = 'rating' | 'fees_asc' | 'fees_desc' | 'ranking';

export interface Filters {
  search: string;
  type: string[];
  state: string[];
  exam: string[];
  feesMin: number;
  feesMax: number;
  sort: SortOption;
}

export interface PredictorInput {
  exam: string;
  rank: number;
  category: string;
  preferredState: string;
}

/* ── Auth ── */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials
  joinedAt: string;
}

/* ── Saved items ── */
export interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  savedAt: string;
}

/* ── Discussion ── */
export interface DiscussionAnswer {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  isAccepted: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  collegeId?: string;
  collegeName?: string;
  answers: DiscussionAnswer[];
  views: number;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}
