/** あるコンテストの基本情報 */
export default interface Contest {
  /** コンテストの slug */
  readonly challenge: string;
  /** コンテストの開催期間 */
  readonly unixtime_range: [number, number];
}