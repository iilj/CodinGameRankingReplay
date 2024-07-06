import useSWR from "swr";
import { Alert } from 'reactstrap';
import Contest from "../../interfaces/Contest";
import { ContestChallengeRangeInfos } from "../../interfaces/LeagueRankingRangeHistory";
import { fetchChallengeRangeInfos } from "../../utils/Data";
import { ChartBlock } from "./ChartBlock";

interface Props {
  users: string[];
  contest: string;
  contests: Contest[];
}

export const ContestChartBlock: React.FC<Props> = (props) => {
  const { users, contest, contests } = props;

  // コンテスト情報
  const {
    data: contestChallengeRangeInfos,
    error: contestChallengeRangeInfosError
  } = useSWR<ContestChallengeRangeInfos | undefined, Error>(
    `/challenges/${contest}`,
    async () => {
      return await fetchChallengeRangeInfos(contests, contest);
    },
  );
  // console.log("contestChallengeRangeInfos", `/challenges/${contest}`, contestChallengeRangeInfos);
  // console.log(contestChallengeRangeInfosError);

  if (users.length === 0) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        UserName is empty or invalid.
      </Alert>
    );
  }

  if (contestChallengeRangeInfosError) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        Failed to fetch contest data ({contest}): {contestChallengeRangeInfosError.message}
      </Alert>
    );
  }
  if (contestChallengeRangeInfos === undefined) {
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
        Fetch contest data ({contest})...
      </div>
    );
  }

  return <ChartBlock users={users} contest={contest} contestChallengeRangeInfos={contestChallengeRangeInfos} />
};