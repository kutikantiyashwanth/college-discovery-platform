export type CollegeType = 'IIT' | 'NIT' | 'IIIT' | 'Private' | 'Deemed' | 'Central University' | 'State University';
export type ExamType = 'JEE Main' | 'JEE Advanced' | 'NEET' | 'CAT' | 'CLAT' | 'GATE';
export type CourseLevel = 'UG' | 'PG' | 'PhD';

export interface Course {
  id: string;
  name: string;
  level: CourseLevel;
  duration: string;
  totalFees: number; // in lakhs
  seats: number;
  exam: ExamType;
  avgPackage: number; // LPA
}

export interface PlacementStat {
  year: number;
  avgPackage: number;   // LPA
  highestPackage: number; // LPA
  placementRate: number; // %
  topRecruiters: string[];
}

export interface Review {
  id: string;
  author: string;
  batch: number;
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  date: string;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  type: CollegeType;
  location: {
    city: string;
    state: string;
  };
  established: number;
  ranking: {
    nirf: number | null;
    qs: number | null;
  };
  rating: number;           // out of 5
  totalRatings: number;
  fees: {
    min: number;  // lakhs
    max: number;  // lakhs
  };
  overview: string;
  highlights: string[];
  courses: Course[];
  placements: PlacementStat[];
  reviews: Review[];
  image: string;           // placeholder color
  acceptedExams: ExamType[];
  tags: string[];
}

export type SortOption = 'rating' | 'fees-asc' | 'fees-desc' | 'ranking' | 'name';

export interface FilterState {
  query: string;
  type: CollegeType | '';
  state: string;
  exam: ExamType | '';
  feeRange: [number, number];
  minRating: number;
  sortBy: SortOption;
}
