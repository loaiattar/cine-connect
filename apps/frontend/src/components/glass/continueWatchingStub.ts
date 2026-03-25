// UI stub (#315): mocked continue-watching data until playback progress is available from API.

export type ContinueWatchingItem = {
  id: number;
  title: string;
  posterPath: string;
  progress: number;
  durationLabel: string;
  remainingLabel: string;
};

export const CONTINUE_WATCHING_STUB: ContinueWatchingItem[] = [
  {
    id: 550,
    title: "Fight Club",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    progress: 42,
    durationLabel: "2h 19m",
    remainingLabel: "1h 20m restantes",
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    posterPath: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    progress: 68,
    durationLabel: "2h 22m",
    remainingLabel: "45m restantes",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    progress: 23,
    durationLabel: "2h 34m",
    remainingLabel: "1h 58m restantes",
  },
];
