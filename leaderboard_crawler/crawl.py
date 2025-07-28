# API access with Python - Contest tools and workflow
# https://www.codingame.com/playgrounds/53705/contest-tools-and-workflow/api-access-with-python

import argparse
import json
import subprocess
from datetime import datetime, timedelta, timezone
from logging import Logger
from pathlib import Path
from time import sleep
from typing import Final

import requests

from logger import LogLevel, get_logger, set_level

# game_id = 453253378
# r = requests.post(
#     'https://www.codingame.com/services/gameResultRemoteService/findByGameId',
#     json=[str(game_id), None]
# )
# replay = r.json()
# print(replay)


# def room() -> None:
#     r = requests.post(
#         "https://www.codingame.com/services/Leaderboards/getFilteredArenaDivisionRoomLeaderboard",
#         json=[
#             {"divisionId": 458, "roomIndex": 0},
#             None,
#             None,
#             {"active": False, "column": "", "filter": ""},
#         ],
#     )
#     replay = r.json()
#     # print(replay)
#     with open(f"{458}.json", "w+") as f:
#         f.write(json.dumps(replay))


# def puzzle(
#     d: datetime, challenge: str = "fall-challenge-2020", filter_str: str = "bronze"
# ) -> None:
#     r = requests.post(
#         "https://www.codingame.com/services/Leaderboards/getFilteredPuzzleLeaderboard",
#         # json=[challenge, "", "global", {"active": True, "column": "LEAGUE", "filter": filter}]
#         json=[challenge, "", "global", {"active": False, "column": "", "filter": ""}],
#         timeout=(60.0, 120.0),
#     )
#     print(r)
#     replay = r.json()
#     # print(replay)
#     datestr: str = d.strftime("%Y%m%d_%H%M%S")
#     with open(f"json/{challenge}_{datestr}_{filter_str}.json", "w+") as f:
#         f.write(json.dumps(replay))

logger: Logger = get_logger()


def get_challenge(
    d: datetime,
    challenge: str = "fall-challenge-2020",
    filter_str: str = "",
    filter_column: str = "LEAGUE",
) -> None:
    """指定コンテストの指定リーグの順位表（上位1000人）を取得して保存する

    Args:
        d (datetime): 保存時に使用する日時
        challenge (str, optional): コンテスト slug. Defaults to 'fall-challenge-2020'.
        filter (str, optional): リーグ slug. Defaults to ''.
    """
    # リソースを取得する
    r: requests.Response = requests.post(
        "https://www.codingame.com/services/Leaderboards/getFilteredChallengeLeaderboard",
        json=[
            challenge,
            "",
            "global",
            {"active": True, "column": filter_column, "filter": filter_str},
        ],
        timeout=(60.0, 120.0),
    )
    logger.info("  -> status_code = %d", r.status_code)
    replay = r.json()
    # print(replay)
    datestr: str = d.strftime("%Y%m%d_%H%M%S")
    fn: str = f"json/challenges/{challenge}/{datestr}_{filter_str}.json"

    # 保存先ディレクトリが存在しないときは再帰的に作成する
    path = Path(fn)
    directory = path.parent
    if not directory.exists():
        directory.mkdir(parents=True)

    # ファイルに書き出す
    with path.open("w+") as f:
        f.write(json.dumps(replay))
    logger.info("  -> saved: %s", fn)


DT_FILENAME: Final[Path] = Path("lastcrawl.json")
DT_FORMAT: Final[str] = "%Y-%m-%d %H:%M:%S.%f"
tz_jst_name = timezone(timedelta(hours=9), name="JST")


def crawl(challenge: str = "spring-challenge-2022", secs: int = 600) -> None:
    """challenge の順位表（各リーグ上位1000人）を secs 秒毎にクロールし続ける

    Args:
        challenge (str, optional): コンテストの slug. Defaults to 'spring-challenge-2022'.
        secs (int, optional): 待機秒数. Defaults to 600.
    """
    # 最終クロール時刻を格納する list を初期化（json にして保存するために list にする）
    data: list[str]
    if DT_FILENAME.exists():
        with DT_FILENAME.open(mode="rt", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = ["2000-01-11 00:00:00.000000"]
    lastd: datetime = datetime.strptime(data[0], DT_FORMAT).astimezone(tz=tz_jst_name)

    # 最後のクロールから secs 以上の時間が経っていなかったら sleep する
    dt_nxt_crawl_start: datetime = lastd + timedelta(seconds=secs)
    td_sleep: timedelta = dt_nxt_crawl_start - datetime.now(tz=tz_jst_name)
    if td_sleep > timedelta(0):
        td_sleep_secs: float = td_sleep.total_seconds()
        logger.info("  -> sleep %f secs (Next: %s) ...", td_sleep_secs, str(dt_nxt_crawl_start))
        sleep(td_sleep_secs)

    filters = ["wood4", "wood3", "wood2", "wood1", "bronze", "silver", "gold", "legend"]
    # filters = ['wood2', 'wood1']
    while True:
        dt_crawl_start = datetime.now(tz=tz_jst_name)
        logger.info("[%s]", str(dt_crawl_start))

        try:
            # リーグごとの結果を取得して保存する
            for i, filter_str in enumerate(filters):
                logger.info("  -> filter[%d/%d]: %s", i, len(filters), filter_str)
                get_challenge(dt_crawl_start, challenge, filter_str, "LEAGUE")
                # break
                # if i != len(filters) - 1:
                sleep(5)
            get_challenge(dt_crawl_start, challenge, "JP", "COUNTRY")
            # クロール時刻を保存する
            with DT_FILENAME.open("w+") as f:
                data = [dt_crawl_start.strftime(DT_FORMAT)]
                f.write(json.dumps(data))
        except Exception:
            # t = "".join(traceback.TracebackException.from_exception(ex).format())
            # print(t)
            logger.exception("Caught exception!")
            subprocess.run(
                ["/usr/bin/play", "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga"],
                check=True,
            )
        dt_nxt_crawl_start = dt_crawl_start + timedelta(seconds=secs)
        td_sleep = dt_nxt_crawl_start - datetime.now(tz=tz_jst_name)
        logger.info("  -> sleep %f secs (Next: %s) ...", td_sleep.total_seconds(), str(dt_nxt_crawl_start))
        # exit()
        sleep(td_sleep.total_seconds())  # 10 mins


def main() -> None:
    parser = argparse.ArgumentParser(description="crawler")
    parser.add_argument("challenge", type=str, help="summer-challenge-2024-olymbits など")
    parser.add_argument("--interval", type=int, default=600, help="クロール間隔（秒単位）")

    args = parser.parse_args()

    crawl(args.challenge, args.interval)


if __name__ == "__main__":
    set_level(LogLevel.DEBUG)
    main()
