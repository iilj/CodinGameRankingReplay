/** あるコンテストの，あるリーグの，ある時点での順位範囲 */
export interface LeagueRankingRangeHistoryEntry {
  /** 時刻 */
  readonly unixtime: number;
  /** 順位範囲 */
  readonly range: [number, number];
}

/** あるコンテストの期間，リーグごとの順位範囲推移，参加者一覧 */
export interface ContestChallengeRangeInfos {
  /** このコンテストの期間 */
  readonly unixtime_range: [number, number];
  /** このコンテストのリーグごとの順位範囲推移 */
  readonly league2ranges: {
    [league: string]: LeagueRankingRangeHistoryEntry[];
  };
  /** このコンテストの参加者一覧 */
  readonly users: string[];
}