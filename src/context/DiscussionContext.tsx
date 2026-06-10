import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Discussion, DiscussionAnswer } from '../types';

interface DiscussionContextValue {
  discussions: Discussion[];
  addDiscussion: (title: string, body: string, tags: string[], collegeId?: string, collegeName?: string) => Discussion;
  addAnswer: (discussionId: string, body: string, authorId: string, authorName: string, authorAvatar: string) => void;
  toggleUpvoteDiscussion: (id: string, userId: string) => void;
  toggleUpvoteAnswer: (discussionId: string, answerId: string, userId: string) => void;
  acceptAnswer: (discussionId: string, answerId: string) => void;
  incrementView: (id: string) => void;
  getDiscussion: (id: string) => Discussion | undefined;
}

const DiscussionContext = createContext<DiscussionContextValue | null>(null);
const STORAGE_KEY = 'cd_discussions';

const SEED: Discussion[] = [
  {
    id: 'd1', title: 'What is the best branch at IIT Bombay for placements?',
    body: 'I got a rank of around 800 in JEE Advanced. Trying to decide between CSE and Electrical. Which one has better placements and overall experience?',
    authorId: 'seed1', authorName: 'Arjun Mehta', authorAvatar: 'AM',
    tags: ['IIT Bombay', 'Placements', 'CSE', 'JEE'],
    collegeId: 'iit-bombay', collegeName: 'IIT Bombay',
    views: 1240, upvotes: 48, upvotedBy: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    answers: [
      {
        id: 'a1', authorId: 'seed2', authorName: 'Rahul Singh', authorAvatar: 'RS',
        body: 'CSE has the best placements by far — median package around ₹35–40L. Electrical is also solid with ₹20–25L median. If you can get CSE, go for it. The curriculum is tough but the opportunities are unmatched.',
        upvotes: 34, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), isAccepted: true,
      },
      {
        id: 'a2', authorId: 'seed3', authorName: 'Priya Sharma', authorAvatar: 'PS',
        body: 'Electrical from IIT Bombay is also excellent. You get opportunities in core companies like Texas Instruments, Qualcomm, as well as software. Dual degree in EE is a great option too.',
        upvotes: 18, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), isAccepted: false,
      },
    ],
  },
  {
    id: 'd2', title: 'CAT vs GMAT — which is better for getting into IIM Ahmedabad?',
    body: 'I am a working professional with 4 years of experience. Considering doing an MBA. Should I take CAT for the PGP programme or GMAT for the PGPX? Confused about the ROI.',
    authorId: 'seed4', authorName: 'Neha Kapoor', authorAvatar: 'NK',
    tags: ['IIM', 'MBA', 'CAT', 'GMAT', 'Career'],
    collegeId: 'iim-ahmedabad', collegeName: 'IIM Ahmedabad',
    views: 890, upvotes: 32, upvotedBy: [],
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    answers: [
      {
        id: 'a3', authorId: 'seed5', authorName: 'Vikram Nair', authorAvatar: 'VN',
        body: 'With 4 years of experience, the PGPX (1-year MBA via GMAT) makes more sense. PGP is more suited for freshers. PGPX batch is smaller, more experienced, and the ROI timeline is shorter.',
        upvotes: 27, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), isAccepted: true,
      },
    ],
  },
  {
    id: 'd3', title: 'BITS Pilani vs NIT Trichy for ECE — which should I choose?',
    body: 'I have offers from both BITS Pilani ECE and NIT Trichy ECE. BITS fees are much higher. Is BITS worth it over NIT Trichy?',
    authorId: 'seed6', authorName: 'Karthik Rajan', authorAvatar: 'KR',
    tags: ['BITS Pilani', 'NIT Trichy', 'ECE', 'Comparison'],
    views: 2100, upvotes: 56, upvotedBy: [],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    answers: [
      {
        id: 'a4', authorId: 'seed7', authorName: 'Divya Menon', authorAvatar: 'DM',
        body: 'BITS Pilani is worth it if your family can afford it without loans. The Practice School program gives 6 months of real industry experience, and the alumni network is fiercely loyal. The placements are significantly better. However, if finances are tight, NIT Trichy ECE is an incredible college with great placements for a fraction of the cost.',
        upvotes: 44, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 11).toISOString(), isAccepted: true,
      },
      {
        id: 'a5', authorId: 'seed8', authorName: 'Arun Kumar', authorAvatar: 'AK',
        body: 'I chose NIT Trichy over BITS and have no regrets. Got a ₹24L package at graduation. The fee difference is massive and the ROI at NIT Trichy is excellent.',
        upvotes: 29, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), isAccepted: false,
      },
    ],
  },
  {
    id: 'd4', title: 'How is campus life at Manipal University?',
    body: 'Getting admitted to Manipal for B.Tech CSE. Heard a lot about the international vibe and the town. What is day-to-day life actually like?',
    authorId: 'seed9', authorName: 'Shreya Bhat', authorAvatar: 'SB',
    tags: ['Manipal', 'Campus Life', 'B.Tech'],
    collegeId: 'manipal-university', collegeName: 'Manipal University',
    views: 670, upvotes: 21, upvotedBy: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    answers: [
      {
        id: 'a6', authorId: 'seed10', authorName: 'Rohan D\'Souza', authorAvatar: 'RD',
        body: 'Manipal is a bubble in the best way. The town exists for students — restaurants, cafes, malls, beach nearby. You will meet students from 57 countries. Academics are decent but you have to be self-driven. The MIT campus has good labs and the MIT-Manipal hackathons are excellent. Cost of living is reasonable.',
        upvotes: 18, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), isAccepted: false,
      },
    ],
  },
  {
    id: 'd5', title: 'Is Delhi University (SRCC) worth it for B.Com if I want to get into consulting?',
    body: 'Got 98.5 percentile in CUET. Likely to get SRCC. Dream is McKinsey or BCG. Is SRCC the right path or should I look at private university BBA programmes?',
    authorId: 'seed11', authorName: 'Anika Gupta', authorAvatar: 'AG',
    tags: ['SRCC', 'Delhi University', 'Commerce', 'Consulting'],
    collegeId: 'srcc-delhi', collegeName: 'SRCC Delhi',
    views: 1450, upvotes: 38, upvotedBy: [],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    answers: [
      {
        id: 'a7', authorId: 'seed12', authorName: 'Ishaan Malhotra', authorAvatar: 'IM',
        body: 'SRCC is the single best undergraduate commerce college in India for consulting ambitions. McKinsey, BCG, Bain all recruit from SRCC GBO (post-grad). The alumni network in consulting is extraordinary. At ₹28K fees for 3 years versus ₹10L+ for private BBA, the ROI is incomparable.',
        upvotes: 33, upvotedBy: [], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), isAccepted: true,
      },
    ],
  },
];

export const DiscussionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* */ }
    return SEED;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discussions));
  }, [discussions]);

  const addDiscussion = useCallback((
    title: string, body: string, tags: string[],
    collegeId?: string, collegeName?: string
  ): Discussion => {
    const d: Discussion = {
      id: `d_${Date.now()}`,
      title, body, tags,
      collegeId, collegeName,
      authorId: 'anon', authorName: 'You', authorAvatar: 'YO',
      answers: [], views: 0, upvotes: 0, upvotedBy: [],
      createdAt: new Date().toISOString(),
    };
    setDiscussions(prev => [d, ...prev]);
    return d;
  }, []);

  const addAnswer = useCallback((
    discussionId: string, body: string,
    authorId: string, authorName: string, authorAvatar: string
  ) => {
    const ans: DiscussionAnswer = {
      id: `ans_${Date.now()}`,
      authorId, authorName, authorAvatar,
      body, upvotes: 0, upvotedBy: [],
      createdAt: new Date().toISOString(), isAccepted: false,
    };
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId ? { ...d, answers: [...d.answers, ans] } : d
    ));
  }, []);

  const toggleUpvoteDiscussion = useCallback((id: string, userId: string) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id !== id) return d;
      const has = d.upvotedBy.includes(userId);
      return {
        ...d,
        upvotes: has ? d.upvotes - 1 : d.upvotes + 1,
        upvotedBy: has ? d.upvotedBy.filter(u => u !== userId) : [...d.upvotedBy, userId],
      };
    }));
  }, []);

  const toggleUpvoteAnswer = useCallback((discussionId: string, answerId: string, userId: string) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id !== discussionId) return d;
      return {
        ...d,
        answers: d.answers.map(a => {
          if (a.id !== answerId) return a;
          const has = a.upvotedBy.includes(userId);
          return {
            ...a,
            upvotes: has ? a.upvotes - 1 : a.upvotes + 1,
            upvotedBy: has ? a.upvotedBy.filter(u => u !== userId) : [...a.upvotedBy, userId],
          };
        }),
      };
    }));
  }, []);

  const acceptAnswer = useCallback((discussionId: string, answerId: string) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id !== discussionId) return d;
      return {
        ...d,
        answers: d.answers.map(a => ({
          ...a, isAccepted: a.id === answerId ? !a.isAccepted : false,
        })),
      };
    }));
  }, []);

  const incrementView = useCallback((id: string) => {
    setDiscussions(prev => prev.map(d =>
      d.id === id ? { ...d, views: d.views + 1 } : d
    ));
  }, []);

  const getDiscussion = useCallback((id: string) =>
    discussions.find(d => d.id === id), [discussions]);

  return (
    <DiscussionContext.Provider value={{
      discussions, addDiscussion, addAnswer,
      toggleUpvoteDiscussion, toggleUpvoteAnswer,
      acceptAnswer, incrementView, getDiscussion,
    }}>
      {children}
    </DiscussionContext.Provider>
  );
};

export const useDiscussion = () => {
  const ctx = useContext(DiscussionContext);
  if (!ctx) throw new Error('useDiscussion must be used within DiscussionProvider');
  return ctx;
};
