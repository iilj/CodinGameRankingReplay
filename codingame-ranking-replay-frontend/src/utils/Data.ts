import { pythonStyleQuote } from ".";
import Contest from "../interfaces/Contest";
import { ContestChallengeRangeInfos } from "../interfaces/LeagueRankingRangeHistory";
import { UserRankingHistory } from "../interfaces/UserRankingHistory";

// コンテスト一覧
let CHALLENGES: Contest[] | undefined = undefined;
export const fetchChallenges = async (): Promise<Contest[] | undefined> =>
  CHALLENGES === undefined
    ? fetch(`${process.env.PUBLIC_URL}/json/challenges.json`)
      .catch((e) => {
        throw e;
      })
      .then(async (r) => {
        CHALLENGES = (await r.json()) as Contest[];
        CHALLENGES.sort((a: Contest, b: Contest): number => {
          // 降順ソート
          return b.unixtime_range[0] - a.unixtime_range[0];
        });
        return CHALLENGES;
      })
    : Promise.resolve(CHALLENGES);

// コンテストごとの詳細情報
const CHALLENGE_RANGE_INFOS_MAP: Map<string, ContestChallengeRangeInfos> = new Map<string, ContestChallengeRangeInfos>();
export const fetchChallengeRangeInfos = async (
  contests: Contest[] | undefined,
  contest: string | undefined,
): Promise<ContestChallengeRangeInfos | undefined> => {
  if (contests === undefined || contest === undefined) {
    return Promise.resolve(undefined);
  } else if (!contests.some(v => v.challenge === contest)) {
    // 存在しないコンテストが指定された場合
    throw Error(`Invalid contest name: ${contest}`);
  } else if (CHALLENGE_RANGE_INFOS_MAP.has(contest)) {
    return Promise.resolve(CHALLENGE_RANGE_INFOS_MAP.get(contest));
  } else {
    return fetch(`${process.env.PUBLIC_URL}/json/challenges/${contest}.json`)
      .catch((e) => {
        throw e;
      })
      .then(async (r) => {
        const challengeRangeInfos = (await r.json()) as ContestChallengeRangeInfos;
        CHALLENGE_RANGE_INFOS_MAP.set(contest, challengeRangeInfos);
        return challengeRangeInfos;
      });
  }
}


const USER_RANKING_HISTORY_MAP: Map<string, UserRankingHistory> = new Map<string, UserRankingHistory>();
export const fetchUserRankingHistories = async (
  contestChallengeRangeInfos: ContestChallengeRangeInfos | undefined,
  contest: string | undefined,
  users: string[]
): Promise<(UserRankingHistory | undefined)[]> => {
  if (contestChallengeRangeInfos === undefined || contest === undefined) {
    return Promise.resolve(users.map(() => undefined));
  }
  const promises = users.map(async (user: string) => {
    if (!contestChallengeRangeInfos.users.some(v => v === user)) {
      // リストに含まれないユーザは弾く
      return Promise.resolve(undefined);
    }
    const key = `${contest}/${user}`;
    // console.log('key', key);
    if (USER_RANKING_HISTORY_MAP.has(key)) {
      return Promise.resolve(USER_RANKING_HISTORY_MAP.get(key));
    } else {
      // ユーザ名はエスケープする
      return fetch(`${process.env.PUBLIC_URL}/json/replays/${contest}/${encodeURIComponent(pythonStyleQuote(user))}.json`)
        .catch((e) => {
          throw e;
        })
        .then(async (r) => {
          const userRankingHistory = (await r.json()) as UserRankingHistory;
          USER_RANKING_HISTORY_MAP.set(key, userRankingHistory);
          return userRankingHistory;
        });
    }
  });
  const result = await Promise.all(promises);
  return result;
}
