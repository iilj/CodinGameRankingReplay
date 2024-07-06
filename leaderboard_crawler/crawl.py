# API access with Python - Contest tools and workflow
# https://www.codingame.com/playgrounds/53705/contest-tools-and-workflow/api-access-with-python

import json
from typing import List, Final
import requests
from datetime import datetime, timedelta
from time import sleep
import pathlib
import traceback
import subprocess

# game_id = 453253378
# r = requests.post(
#     'https://www.codingame.com/services/gameResultRemoteService/findByGameId',
#     json=[str(game_id), None]
# )
# replay = r.json()
# print(replay)


def room() -> None:
    r = requests.post(
        "https://www.codingame.com/services/Leaderboards/getFilteredArenaDivisionRoomLeaderboard",
        json=[
            {"divisionId": 458, "roomIndex": 0},
            None,
            None,
            {"active": False, "column": "", "filter": ""},
        ],
    )
    replay = r.json()
    # print(replay)
    with open(f"{458}.json", "w+") as f:
        f.write(json.dumps(replay))


def puzzle(
    d: datetime, challenge: str = "fall-challenge-2020", filter: str = "bronze"
) -> None:
    r = requests.post(
        "https://www.codingame.com/services/Leaderboards/getFilteredPuzzleLeaderboard",
        # json=[challenge, "", "global", {"active": True, "column": "LEAGUE", "filter": filter}]
        json=[challenge, "", "global", {"active": False, "column": "", "filter": ""}],
    )
    print(r)
    replay = r.json()
    # print(replay)
    datestr: str = d.strftime("%Y%m%d_%H%M%S")
    with open(f"json/{challenge}_{datestr}_{filter}.json", "w+") as f:
        f.write(json.dumps(replay))


def get_challenge(
    d: datetime,
    challenge: str = "fall-challenge-2020",
    filter: str = "",
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
            {"active": True, "column": filter_column, "filter": filter},
        ],
    )
    print(f"  -> status_code = {r.status_code}")
    replay = r.json()
    # print(replay)
    datestr: str = d.strftime("%Y%m%d_%H%M%S")
    fn: str = f"json/challenges/{challenge}/{datestr}_{filter}.json"

    # 保存先ディレクトリが存在しないときは再帰的に作成する
    path = pathlib.Path(fn)
    directory = path.parent
    if not directory.exists():
        directory.mkdir(parents=True)

    # ファイルに書き出す
    with open(fn, "w+") as f:
        f.write(json.dumps(replay))
    print(f"  -> saved: {fn}")


DT_FILENAME: Final[str] = "lastcrawl.json"
DT_FORMAT: Final[str] = "%Y-%m-%d %H:%M:%S.%f"


def crawl(challenge: str = "spring-challenge-2022", secs: int = 600) -> None:
    """challenge の順位表（各リーグ上位1000人）を secs 秒毎にクロールし続ける

    Args:
        challenge (str, optional): コンテストの slug. Defaults to 'spring-challenge-2022'.
        secs (int, optional): 待機秒数. Defaults to 600.
    """
    # 最終クロール時刻を格納する list を初期化（json にして保存するために list にする）
    data: List[str]
    if pathlib.Path(DT_FILENAME).exists():
        with open(DT_FILENAME, mode="rt", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = ["2000-01-11 00:00:00.000000"]
    lastd: datetime = datetime.strptime(data[0], DT_FORMAT)

    # 最後のクロールから secs 以上の時間が経っていなかったら sleep する
    dt_nxt_crawl_start: datetime = lastd + timedelta(seconds=secs)
    td_sleep: timedelta = dt_nxt_crawl_start - datetime.now()
    if td_sleep > timedelta(0):
        td_sleep_secs: float = td_sleep.total_seconds()
        print(f"  -> sleep {td_sleep_secs} secs (Next: {dt_nxt_crawl_start}) ...")
        sleep(td_sleep_secs)

    filters = ["wood2", "wood1", "bronze", "silver", "gold", "legend"]
    # filters = ['wood2', 'wood1']
    while True:
        dt_crawl_start = datetime.now()
        print(f"[{dt_crawl_start}]")

        try:
            # リーグごとの結果を取得して保存する
            for i, filter in enumerate(filters):
                print(f"  -> filter[{i}/{len(filters)}]: {filter}")
                get_challenge(dt_crawl_start, challenge, filter, "LEAGUE")
                # break
                # if i != len(filters) - 1:
                sleep(5)
            get_challenge(dt_crawl_start, challenge, "JP", "COUNTRY")
            # クロール時刻を保存する
            with open(DT_FILENAME, "w+") as f:
                data = [dt_crawl_start.strftime(DT_FORMAT)]
                f.write(json.dumps(data))
        except Exception as ex:
            t = "".join(traceback.TracebackException.from_exception(ex).format())
            print(t)
            cmd = "play /usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga"
            subprocess.run(cmd, shell=True)
        dt_nxt_crawl_start = dt_crawl_start + timedelta(seconds=secs)
        td_sleep = dt_nxt_crawl_start - datetime.now()
        print(
            f"  -> sleep {td_sleep.total_seconds()} secs (Next: {dt_nxt_crawl_start}) ..."
        )
        # exit()
        sleep(td_sleep.total_seconds())  # 10 mins


if __name__ == "__main__":
    crawl("summer-challenge-2024-olymbits", 600)
