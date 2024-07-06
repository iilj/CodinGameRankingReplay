import React from 'react';
import dataFormat from 'dateformat';
import { UserRankingHistoryEntry } from '../../interfaces/UserRankingHistory';
import { LeagueRankingRangeHistoryEntry } from '../../interfaces/LeagueRankingRangeHistory';

interface RankLineChartTooltipPayloadContainer {
  color: string; // "#xxxxxx"
  dataKey: string; // "rank"
  fill: string;
  name: string; // atcoder user name
  stroke: string; // "#xxxxxx"
  strokeWidth: number;
  value: number;
  payload: UserRankingHistoryEntry | LeagueRankingRangeHistoryEntry;
}

interface Props {
  active?: boolean;
  payload?: RankLineChartTooltipPayloadContainer[];
  label?: number;
  // perfs?: any;
}

export const LineChartTooltip: React.FC<Props> = (props) => {
  const { active, payload, label, } = props;
  if (!active || payload === undefined || label === undefined) return <></>;
  return (
    <div
      className="recharts-default-tooltip"
      style={{
        margin: '0px',
        padding: '10px',
        backgroundColor: 'rgb(255, 255, 255)',
        border: '1px solid rgb(204, 204, 204)',
        whiteSpace: 'nowrap',
      }}
    >
      <p className="recharts-tooltip-label" style={{ margin: '0px' }}>
        {dataFormat(new Date(label * 1000), 'yyyy-mm-dd HH:MM:ss')}
      </p>
      {payload
        .map((payloadContainer: RankLineChartTooltipPayloadContainer) => {
          const curPayload: UserRankingHistoryEntry | LeagueRankingRangeHistoryEntry = payloadContainer.payload;
          if ('range' in curPayload) {
            // curPayload は LeagueRankingRangeHistoryEntry
            return (
              <>
              </>
            )
          }
          // curPayload は UserRankingHistoryEntry
          // console.log(curPayload);
          return (
            <div key={payloadContainer.name}>
              <hr style={{ marginTop: '0.3em', marginBottom: '0.3em' }} />
              <div
                style={{ color: payloadContainer.stroke }}
              >{`User: ${payloadContainer.name}`}</div>
              <ul
                className="recharts-tooltip-item-list"
                style={{ padding: '0px', margin: '0px' }}
              >
                <li
                  className="recharts-tooltip-item"
                  style={{
                    display: 'block',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    color: 'rgb(136, 132, 216)',
                  }}
                >
                  <span className="recharts-tooltip-item-name">Global rank</span>
                  <span className="recharts-tooltip-item-separator"> : </span>
                  <span className="recharts-tooltip-item-value">
                    {curPayload.rank}
                  </span>
                  <span className="recharts-tooltip-item-unit" />
                </li>
                <li
                  className="recharts-tooltip-item"
                  style={{
                    display: 'block',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    color: 'rgb(136, 132, 216)',
                  }}
                >
                  <span className="recharts-tooltip-item-name">League rank</span>
                  <span className="recharts-tooltip-item-separator"> : </span>
                  <span className="recharts-tooltip-item-value">
                    {curPayload.localRank}
                  </span>
                  <span className="recharts-tooltip-item-unit" />
                </li>
              </ul>
            </div>
          )
        })
        .filter((element) => element !== undefined)}
    </div>
  );
};