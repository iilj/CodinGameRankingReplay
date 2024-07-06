import json
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import Final

from tqdm import tqdm


DATE_FORMAT: Final[str] = "%Y%m%d_%H%M%S %z"
LEAGUES: list[str] = ["legend", "gold", "silver", "bronze", "wood1", "wood2", "JP"]


def main() -> None:
    # ディレクトリ一覧
    challenges: list[Path] = list((Path(__file__).parent / 'json/challenges').glob('*'))
    challenges.sort()

    # 出力先
    dst_parent_path = Path(__file__).parent.parent / 'codingame-ranking-replay-frontend/public/json'
    # if not dst_parent_path.exists():
    #     dst_parent_path.mkdir()
    assert dst_parent_path.exists() and dst_parent_path.is_dir()

    challenges_list = []

    for challenge in challenges:
        # if (dst_parent_path / f"ranges/{challenge.name}.json").exists():
        #     continue
        print(f"## processing {challenge.name}")

        # datetimestr => league => jsonpath
        datetime2paths: dict[str, dict[str, Path]] = {}

        jsons: list[Path] = list(challenge.glob("*.json"))
        jsons.sort()
        for jsonpath in jsons:
            datetimestr: str = jsonpath.name[:15]
            league: str = jsonpath.name[16:-5]
            if not (datetimestr in datetime2paths):
                datetime2paths[datetimestr] = {}
            datetime2paths[datetimestr][league] = jsonpath

        unixtime_min: int = 1000000000000000000
        unixtime_max: int = -1

        # user => (datetime, rank)
        user2history: dict[str, list[dict[str, int]]] = {}
        # league => [(datetime, rank_min, rank_max)]
        league2ranges: dict[str, list[dict[str, int | list[int]]]] = {}
        for league in LEAGUES[:6]:
            league2ranges[league] = []
        # JSON 読み込み
        for datetimestr, league2filepath in tqdm(datetime2paths.items()):
            # 6種類のリーグすべてが揃っていない場合は飛ばす
            if len(league2filepath) < 6:
                print(f"skip {datetimestr}, len={len(league2filepath)}")
                continue

            # unixtime 変換
            dt = datetime.strptime(f"{datetimestr} +0900", DATE_FORMAT) # タイムゾーン付与
            unixtime = int(dt.timestamp())
            unixtime_min = min(unixtime_min, unixtime)
            unixtime_max = max(unixtime_max, unixtime)

            processed_users = set() # 処理済みユーザ
            # 上位リーグから順に探す
            for idx, league in enumerate(LEAGUES):
                if not league in league2filepath:
                    continue
                jsonpath: Path = league2filepath[league]
                assert jsonpath is not None
                with open(jsonpath, "r") as f:
                    try:
                        json_dict = json.load(f)
                    except json.decoder.JSONDecodeError as e:
                        print(f"  -> Failed to load {jsonpath}: {e}")
                        raise e
                if not "users" in json_dict:
                    continue
                users: list = json_dict["users"]
                if len(users) == 0:
                    continue
                rank_min: int = 1000000000
                rank_max: int = -1
                for user in users:
                    if not ("pseudo" in user):
                        continue
                    pseudo: str = user["pseudo"]
                    rank: int = user["rank"]
                    if pseudo in processed_users:
                        continue
                    value: dict[str, int] = {
                        "unixtime": unixtime,
                        "rank": rank,
                        "localRank": user["localRank"],
                        "league": league
                    }
                    if not pseudo in user2history:
                        user2history[pseudo] = [value]
                    else:
                        user2history[pseudo].append(value)
                    processed_users.add(pseudo)
                    rank_min = min(rank_min, rank)
                    rank_max = max(rank_max, rank)
                if rank_max != -1 and league != "JP":
                    range_value = {
                        "unixtime": unixtime,
                        "range": [rank_min - 0.5, rank_max + 0.5]
                    }
                    league2ranges[league].append(range_value)
                # リーグ順位の max の値は，1つ下のリーグの min のほうが大きいなら更新する．
                # （各リーグ最大1000人しか記録されていないが，その下も本当はいるかもしれず，
                # そのときは max が実際より小さい値（min+999）になっているので）
                if idx > 0 and league != "JP":
                    next_league = LEAGUES[idx - 1]
                    if len(league2ranges[next_league]) > 0 and len(league2ranges[league]) > 0:
                        unixtimeval = league2ranges[next_league][-1]["unixtime"]
                        rangeval = league2ranges[next_league][-1]["range"]
                        assert isinstance(unixtimeval, int)
                        assert isinstance(rangeval, list)
                        if unixtimeval == unixtime:
                            rangeval[1] = max(rangeval[1], league2ranges[league][-1]["range"][0])

        # 誰も "legend" に居ないのなら，クロールを途中で打ち切ったと見る
        if len(league2ranges["legend"]) == 0:
            print('  -> len(league2ranges["legend"]) == 0')
            continue

        # 出力先
        replays_dst_path: Path = dst_parent_path / "replays" / challenge.name
        if not replays_dst_path.exists():
            replays_dst_path.mkdir()
        assert replays_dst_path.exists() and replays_dst_path.is_dir()
        challenges_dst_path: Path = dst_parent_path / "challenges"
        if not challenges_dst_path.exists():
            challenges_dst_path.mkdir()
        assert challenges_dst_path.exists() and challenges_dst_path.is_dir()

        # export
        # 各ユーザの順位履歴
        for pseudo, history in tqdm(user2history.items()):
            with (replays_dst_path / f"{urllib.parse.quote(pseudo)}.json").open(mode="w", encoding="utf-8") as f:
                json.dump(history, f)
        
        # チャレンジの各リーグの順位範囲履歴
        with (challenges_dst_path / f"{challenge.name}.json").open(mode="w", encoding="utf-8") as f:
            obj = {
                "unixtime_range": [unixtime_min, unixtime_max],
                "league2ranges": league2ranges,
                "users": list(user2history.keys())
            }
            json.dump(obj, f)
        
        challenges_list.append({"challenge": challenge.name, "unixtime_range": [unixtime_min, unixtime_max]})
    
    # チャレンジ一覧
    with (dst_parent_path / "challenges.json").open(mode="w", encoding="utf-8") as f:
        json.dump(challenges_list, f)



if __name__ == "__main__":
    main()
