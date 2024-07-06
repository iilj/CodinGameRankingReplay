import { useParams } from 'react-router-dom'
import useSWR from 'swr'
import { Alert } from 'reactstrap';
import Contest from '../../interfaces/Contest';
import { fetchChallenges } from '../../utils/Data';
import { FormBlock } from './FormBlock';
import { ContestChartBlock } from './ContestChartBlock';

export const ChartPage = () => {
  const urlParams = useParams<{
    contest: string;
    pseudo: string;
  }>();
  // console.log("urlParams.contest", urlParams.contest);
  // console.log("urlParams.pseudo", urlParams.pseudo);

  // コンテスト一覧
  const { data: contests, error: contestsError } = useSWR<Contest[] | undefined, Error>(
    '/challenges',
    fetchChallenges
  );
  // console.log("contests", contests);
  // console.log(contestsError);

  if (contestsError) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        Failed to fetch contests: {contestsError.message}
      </Alert>
    );
  }

  // 指定されたユーザの履歴
  const users: string[] = (urlParams.pseudo ?? '')
    .split(',')
    .map((_user) => _user.trim())
    .filter((_user) => _user !== '');

  return (
    <>
      <h2>Description</h2>
      <p>
        <a href="https://www.codingame.com/">CodinGame</a>{' '}
        で行われたコンテストにおける順位の推移をグラフに表示します．
      </p>
      <h2>Let&apos;s Replay!</h2>
      {contestsError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest list.
        </Alert>
      ) : contests === undefined ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest data...
        </div>
      ) : (
        <FormBlock
          paramUsers={urlParams.pseudo ?? ''}
          paramContest={urlParams.contest ?? ''}
          contests={contests}
        />
      )}
      {(contests && urlParams.contest)
        ? <ContestChartBlock users={users} contest={urlParams.contest} contests={contests} />
        : <></>}
    </>
  )
};