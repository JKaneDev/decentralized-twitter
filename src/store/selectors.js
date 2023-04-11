import { get } from 'lodash';
import { createSelector } from 'reselect';

const allTweets = (state) => get(state, 'twitter.allTweets.data', []);
export const allTweetsSelector = createSelector(allTweets, (tw) => tw);

const allTweetsLoaded = (state) => get(state, 'twitter.allTweets.loaded', false);
export const allTweetsLoadedSelector = createSelector(allTweetsLoaded, (loaded) => loaded);
