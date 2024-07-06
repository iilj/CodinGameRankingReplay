/** あるコンテストにおける，あるユーザの，ある時点での順位記録 */
export interface UserRankingHistoryEntry {
  /** 時刻 */
  readonly unixtime: number;
  /** 総合順位 */
  readonly rank: number;
  /** リーグ内順位 */
  readonly localRank: number;
  /** リーグ名 */
  readonly league: string;
}

export type UserRankingHistory = UserRankingHistoryEntry[];
