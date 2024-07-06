import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Input, Row, FormGroup, Label, Col } from 'reactstrap';
import dataFormat from 'dateformat';
import Contest from '../../interfaces/Contest';

interface Props {
  paramUsers: string;
  paramContest: string;
  contests: Contest[] | undefined;
}

const generatePath = (contest: string, user: string): string =>
  `/chart/${contest}/${encodeURIComponent(user)}`;
const getContestDropdownLabel = (contest: Contest): string =>
  `${dataFormat(new Date(contest.unixtime_range[0] * 1000), 'yyyy-mm-dd')} ${contest.challenge
  }`;

export const FormBlock: React.FC<Props> = (props) => {
  const { paramUsers, paramContest, contests } = props;
  const [contest, setContest] = useState(
    paramContest !== ''
      ? paramContest
      : (contests && contests.length > 0)
        ? contests[0].challenge
        : ''
  );
  const [user, setUser] = useState(paramUsers);
  const chartPagePath = useMemo(() => generatePath(contest, user), [
    contest,
    user,
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    let unmounted = false;
    const setDefaultContestValue = () => {
      if (!unmounted && contests && contests.length > 0 && contest === '')
        setContest(contests[0].challenge);
    };
    void setDefaultContestValue();
    const cleanup = () => {
      unmounted = true;
    };
    return cleanup;
  }, [contests, contest]);

  return (
    <>
      <Row>
        <Col sm={12}>
          <FormGroup style={{ width: '100%' }}>
            <Label for="input-contest">CONTEST:</Label>
            <Input
              type="select"
              name="input-contest"
              id="input-contest"
              value={contest}
              onChange={(e): void => setContest(e.target.value)}
            >
              {contests?.map((_contest: Contest) => {
                return (
                  <option
                    value={_contest.challenge}
                    key={_contest.challenge}
                  >
                    {getContestDropdownLabel(_contest)}
                  </option>
                );
              })}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <FormGroup style={{ width: '100%' }}>
            <Label for="input-user">USER NAME (COMMA SEPARATED):</Label>
            <Input
              value={user}
              type="text"
              name="input-user"
              id="input-user"
              placeholder={user ? user : 'user1,user2,...'}
              onChange={(e): void => setUser(e.target.value)}
              onKeyPress={(e): void => {
                if (e.key === 'Enter') {
                  navigate(chartPagePath);
                }
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Button color="primary" tag={NavLink} to={chartPagePath} block>
            Replay!
          </Button>
        </Col>
      </Row>
    </>
  );
};