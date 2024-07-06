import { Alert, UncontrolledTooltip } from 'reactstrap';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Label,
  ComposedChart,
  Area,
} from 'recharts';
import useSWR from 'swr'
import dataFormat from 'dateformat';
import { XIcon, TwitterShareButton } from 'react-share';
import { UserRankingHistory, UserRankingHistoryEntry } from '../../interfaces/UserRankingHistory';
import { ContestChallengeRangeInfos } from '../../interfaces/LeagueRankingRangeHistory';
import { getChartLineColor, getDatetimeTickFormatter, getDatetimeTicks, getRankTicks } from '../../utils/Chart';
import { fetchUserRankingHistories } from '../../utils/Data';

const LEAGUE_COLOR: [string, string][] = [
  ["legend", "#f96249"],
  ["gold", "#f4ae3d"],
  ["silver", "#849aa4"],
  ["bronze", "#b6a28b"],
  ["wood1", "#7cc576"],
  ["wood2", "#7cc576"],
];

interface Props {
  users: string[];
  contest: string;
  contestChallengeRangeInfos: ContestChallengeRangeInfos;
}

export const ChartBlock: React.FC<Props> = (props) => {
  const { users, contest, contestChallengeRangeInfos, } = props;

  const {
    data: userRankingHistories,
    error: userRankingHistoriesError
  } = useSWR<(UserRankingHistory | undefined)[], Error>(
    users.map(user => `/replays/${contest}/${user}.json`),
    async () => {
      return await fetchUserRankingHistories(contestChallengeRangeInfos, contest, users);
    },
  );
  // console.log("userRankingHistories", userRankingHistories, users.map(user => `/replays/${contest}/${user}.json`));
  // console.log(userRankingHistoriesError);

  if (userRankingHistoriesError) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        Failed to fetch user ranking history: {userRankingHistoriesError.message}
      </Alert>
    );
  }
  if (userRankingHistories === undefined) {
    return (
      <div
        style={{
          width: '100%',
          height: '500px',
          textAlign: 'center',
          marginTop: '100px',
          marginBottom: '100px',
        }}
      >
        Fetch user ranking history...
      </div>
    );
  }
  if (userRankingHistories.every(v => v === undefined)) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        Specified user not found.
      </Alert>
    );
  }

  const maxRank = userRankingHistories.reduce((prev: number, userRankingHistory: UserRankingHistory | undefined): number => {
    if (userRankingHistory === undefined) {
      return prev;
    }
    return userRankingHistory.reduce((prev2: number, userRankingHistoryEntry: UserRankingHistoryEntry): number => {
      return Math.max(prev2, userRankingHistoryEntry.rank);
    }, prev);
  }, 1);
  const rankTicks = getRankTicks(maxRank);
  const maxRankForChart = rankTicks[rankTicks.length - 1];

  let maxRankText = '';
  if (userRankingHistories.length === 1 && userRankingHistories[0] !== undefined) {
    const [maxtime, maxrank] = userRankingHistories[0].reduce(
      (
        prev: [number, number],
        userRankingHistoryEntry: UserRankingHistoryEntry
      ): [number, number] => {
        const prevRank = prev[1];
        if (prevRank < userRankingHistoryEntry.rank) return prev;
        return [userRankingHistoryEntry.unixtime, userRankingHistoryEntry.rank];
      },
      [-1, 1000000000] as [number, number]
    );
    maxRankText = `\n最大瞬間風速は ${maxrank} 位 (${dataFormat(
      new Date(maxtime * 1000),
      'mm/dd HH:MM'
    )}) だよ！`;
  }
  const tweetTitle =
    `${users.join(',')}'s replay of ${contest}\n` +
    `${maxRankText}\n` +
    `CodinGame Ranking Replay`;

  return (
    <>
      {
        userRankingHistories.map((userRankingHistory: UserRankingHistory | undefined, index: number) => {
          if (userRankingHistory === undefined) {
            return (
              <Alert
                key={`user-not-found-${index}`}
                color="danger"
                style={{
                  marginTop: '50px',
                  marginBottom: '50px',
                }}
              >
                User {users[index]} not found.
              </Alert>
            );
          }
          return undefined;
        })
      }
      <h4
        style={{
          textAlign: 'center',
          marginTop: '30px',
          marginBottom: '-30px',
        }}
      >
        Replay of {contest}
      </h4>
      <div style={{ width: '100%', height: '500px', marginTop: '50px' }}>
        <ResponsiveContainer>
          <ComposedChart
            width={1000}
            height={500}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="unixtime"
              name="unixtime"
              domain={contestChallengeRangeInfos.unixtime_range}
              tickFormatter={getDatetimeTickFormatter(...(contestChallengeRangeInfos.unixtime_range))}
              ticks={getDatetimeTicks(...(contestChallengeRangeInfos.unixtime_range))}
            >
              <Label value="Datetime" offset={0} position="insideBottom" />
            </XAxis>
            <YAxis
              type="number"
              name="rank"
              label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
              reversed
              domain={[0, maxRankForChart]}
              ticks={rankTicks}
              allowDataOverflow
            />
            {/* <Tooltip content={<LineChartTooltip />} /> */}
            <Legend />
            {
              LEAGUE_COLOR.map(([league, color]) => {
                // console.log(league, color, ranges[league]);
                return (
                  <Area
                    key={league}
                    name={`area-${league}`}
                    dataKey="range"
                    data={contestChallengeRangeInfos.league2ranges[league]}
                    dot={false}
                    activeDot={false}
                    stroke={color}
                    strokeOpacity={0.3}
                    strokeWidth={0}
                    fill={color}
                    fillOpacity={0.3}
                    legendType="none"
                  />
                )
              })
            }
            {
              userRankingHistories.map((userRankingHistory: UserRankingHistory | undefined, index: number) => {
                if (userRankingHistory === undefined) {
                  return <></>
                }
                const color = getChartLineColor(index);
                return (
                  <Line
                    key={`line-${users[index]}`}
                    data={userRankingHistory}
                    name={users[index]}
                    dataKey="rank"
                    type="linear"
                    stroke={color}
                    dot={false}
                  >
                  </Line>
                )
              })
            }
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'center' }}>
        <TwitterShareButton
          url={window.location.href}
          title={tweetTitle}
          id="chart-share-button"
        >
          <XIcon size={40} round />
        </TwitterShareButton>
        <UncontrolledTooltip placement="top" target="chart-share-button">
          {(tweetTitle + ' ' + window.location.href).replaceAll('\n', ' ')}
        </UncontrolledTooltip>
      </div>
    </>
  )
};
