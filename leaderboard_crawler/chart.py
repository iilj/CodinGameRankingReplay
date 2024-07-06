import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set
from typing_extensions import Final
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes
import matplotlib.dates as mdates
from tqdm import tqdm


def main(challenge: str = "spring-challenge-2022", pseudo: str = "iilj") -> None:
    # dirpath: Path = Path('/myfiles/git/codingame_leaderboard_crawler/json/challenges/spring-challenge-2021')
    dirpath: Path = Path(f"./json/challenges/{challenge}")
    datetime2paths: Dict[str, Dict[str, Path]] = {}
    for filepath in sorted(dirpath.glob("*.json")):
        datetimestr: str = filepath.name[:15]
        league: str = filepath.name[16:-5]
        # print(datetimestr, league)
        if not (datetimestr in datetime2paths):
            datetime2paths[datetimestr] = {}
        datetime2paths[datetimestr][league] = filepath
    # print(list(datetime2paths.keys()))
    # exit()
    keys: List[str] = ["legend", "gold", "silver", "bronze", "wood1", "wood2", "JP"]
    x: List[datetime] = []
    y: List[int] = []
    x_discarded: List[datetime] = []
    # read cache
    CHART_CACHE_FN: Final[str] = f"chart-cache_{challenge}_{pseudo}.json"
    DATE_FORMAT: Final[str] = "%Y%m%d_%H%M%S"
    cache_ex: Set[str] = set()
    cache_dx: Set[str] = set()
    if Path(CHART_CACHE_FN).exists():
        with open(CHART_CACHE_FN, "r") as f:
            data = json.load(f)
            x = [datetime.strptime(dtstr, DATE_FORMAT) for dtstr in data["x"]]
            y = data["y"]
            cache_ex = set(data["x"])
            x_discarded = [
                datetime.strptime(dtstr, DATE_FORMAT) for dtstr in data["x_discarded"]
            ]
            cache_dx = set(data["x_discarded"])
    else:
        pass
    # read json
    for datetimestr, paathdic in tqdm(datetime2paths.items()):
        if len(paathdic) < 6 or len(paathdic) > 7:
            print(f"skip {datetimestr}, len={len(paathdic)}")
            continue
        if datetimestr in cache_ex:
            continue
        if datetimestr in cache_dx:
            continue
        found: bool = False
        found_user = None
        for key in keys:
            jsonpath: Path = paathdic[key]
            assert jsonpath is not None
            with open(jsonpath, "r") as f:
                json_dict = json.load(f)
            if not "users" in json_dict:
                continue
            users: list = json_dict["users"]
            if len(users) == 0:
                continue
            for user in users:
                if not ("pseudo" in user):
                    continue
                if user["pseudo"] == pseudo:
                    found = True
                    found_user = user
                    break
            if found:
                break
        if found:
            x.append(datetime.strptime(datetimestr, DATE_FORMAT))
            y.append(found_user["rank"])
        else:
            x_discarded.append(datetime.strptime(datetimestr, DATE_FORMAT))
    # save cache
    data = {
        "x": [dt.strftime(DATE_FORMAT) for dt in x],
        "y": y,
        "x_discarded": [dt.strftime(DATE_FORMAT) for dt in x_discarded],
    }
    with open(CHART_CACHE_FN, "w+") as f:
        f.write(json.dumps(data))
    # print(x)
    # print(y)
    # exit()

    # draw chart
    figure: Figure = plt.figure()
    ax: Axes = figure.add_subplot(1, 1, 1)
    ax.plot(x, y)

    xfmt = mdates.DateFormatter("%m/%d")
    xloc = mdates.DayLocator()

    ax.xaxis.set_major_locator(xloc)
    ax.xaxis.set_major_formatter(xfmt)
    ax.invert_yaxis()
    ax.set_title(f"Rank of {pseudo}")

    ax.grid(linestyle="dotted", linewidth=1)
    plt.show()


if __name__ == "__main__":
    main("summer-challenge-2024-olymbits", "iilj")
    # main("spring-challenge-2023", "bowwowforeach")
