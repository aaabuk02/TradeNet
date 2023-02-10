import requests
import unicodedata
from time import sleep
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import re

URL = "https://prosportstransactions.com/basketball/Search/SearchResults.php?Player=trade+with&Team=&BeginDate=1977-01-01&EndDate=&PlayerMovementChkBx=yes&Submit=Search"
page = requests.get(URL)
soup = BeautifulSoup(page.content, features="html5lib")
table = soup.find('table')
rows = table.findChildren(['th', 'tr'])


exempted_keys = set(["2000-02-01_Magic_Nuggets", "2016-06-29_Magic_Pistons", "1996-12-04_Bucks_Suns",
                    "2021-07-30_Bucks_Pacers", "2013-07-22_Grizzlies_Mavericks", "2000-02-09_Celtics_Raptors",
                     "1983-11-12_76ers_Pistons", "1986-08-08_Bullets_Nets", "1987-10-11_Blazers_Warriors",
                     "1987-10-14_Rockets_Warriors", "1989-06-27_Bulls_Sonics", "1992-06-01_Bucks_Lakers (date approximate)",
                     "1992-06-01_Bucks (date approximate)_Lakers", "1997-05-27_Celtics_Heat", "2011-12-11_Lakers_Mavericks"])
nodes_to_revised = {"• Marcus Banks (changed to Jumaine Jones on 2004-08-13)": "• Jumaine Jones",
                    " • Bobcats agreed to select Jahidi White from Suns in expansion draft": "• expansion rights to Jahidi White",
                    "• Bobcats agreed to select Predrag Drobnjak / Peja Drobnjak in expansion draft": "• expansion rights to Peja Drobnjak",
                    "• 2026 draft pick (first round protected top 4, else second round) (?-?)": "• 2026 draft pick (first round pick protected top 4, else second round) (?-?)",
                    "• 2021 second round pick (#32-Jeremiah Robinson-Earl)": "• 2021 second round pick (#32-Jeremiah Robinson Earl)",
                    " • 2021 second round pick (#32-Jeremiah Robinson-Earl)": "• 2021 second round pick (#32-Jeremiah Robinson Earl)",
                    " • $100K": "• $100K cash",
                    "• the rights to Sergio Llull": "• rights to Sergio Llull",
                    "• 1982 second round pick (#42-Jeff Taylor (b. 1960-01-01))": "• 1982 second round pick (#42-Jeff Taylor)",
                    " • 1985 first round pick (#24-Terry Porter (b. 1963-04-08))": "• 1985 first round pick (#24-Terry Porter)",
                    "• 1985 first round pick (#24-Terry Porter (b. 1963-04-08))": "• 1985 first round pick (#24-Terry Porter)",
                    "• 1987 conditional pick (second round if Thompson joins Bucks roster this season, else third round) (#41-Kannard Johnson)": "• 1987 conditional second round pick (second round if Thompson joins Bucks roster this season, else third round) (#41-Kannard Johnson)",
                    "• Bucks option to swap 2010 first round picks (Bulls pick protected top 10) (#15-Larry Sanders (b. 1988-11-21))": "• Bucks option to swap 2010 first round picks (Bulls pick protected top 10) (#15-Larry Sanders)",
                    "• 2000 second round pick (#34-Khalid El-Amin)": "• 2000 second round pick (#34-Khalid El Amin)",
                    "• Hawks 1986 \"top\" pick (?-?)": "• Hawks 1986 top draft pick (?-?)",
                    "• player to be named later (Tom Barker / Tommy Barker on 1979-02-14)": "• Tommy Barker",
                    "• player to be named later (Mark Radford on 08-30)": "• Mark Radford",
                    " • rights to restricted free agent Mike Bratz": "• restricted free agent rights to Mike Bratz",
                    "• player to be named later (Gus Gerard on 11-25)": "• Gus Gerard",
                    "• 2019 second round pick (#46-Talen Horton-Tucker)": "• 2019 second round pick (#46-Talen Horton Tucker)",
                    "• player to be named later (Darnell Hillman on 1977-04-11)": "• Darnell Hillman",
                    " • rights to Wally Walker- later replaced by Bill Hanzlik": "• rights to Bill Hanzlik",
                    " • rights to restricted free agent Coby Dietrick": "• restricted free agent rights to Coby Dietrick",
                    "• Rockets right to match offer sheet on free agent Dirk Minniefield": "• Rockets right to match offer sheet on free agent rights to Dirk Minniefield",
                    " • Sonics agreed to not select Dennis Scott with the 1990 #2 pick": " • Sonics agreed to not select with the 1990 #2 pick; rights to Dennis Scott",
                    " • Nets agreed to not select Dennis Scott in 1990 draft": " • Nets agreed to not select in the 1990 draft; rights to Dennis Scott",
                    "• Nets waived right to void trade if Seikaly did not report": " ",
                    }


def update_edges_csv(file, filename, columns, data):
    df = pd.DataFrame([data], columns=columns)
    file = pd.concat([file, df])
    file.to_csv(filename, index=False)
    return file


def classify_str(data: str):
    offset = 1 if data[0] == ' ' else 0
    if " cash" in data or "future considerations" in data or "future draft considerations (?)":
        return ["C", "None"]
    elif "rights to" in data:
        return ["RT ", data[data.find('rights to')+10:]]
    elif "exception" in data:
        return ["EX ", "None"]
    elif "round pick" in data or "draft pick" in data:
        if "#" in data and '-' in data and "?-?" not in data and "not exercised" not in data:
            return ["RPC ", data[data.rfind('-')+1:-1]]
        return ["RP ", "None"]
    elif "first refusal" in data:
        return ["FR ", "None"]
    elif "expansion draft" in data:
        return ["EP ", "None"]
    else:
        if '•' in data:
            return ["PL ", data[data.index('•')+2:]]
        return ["UK ", "None"]


class node:
    def __init__(self, team, date):
        self.name = "n/a"
        self.node_type = "n/a"
        self.draft_details = "n/a"
        self.team = team
        self.date = date
        self.isRightsorPick = False
        self.isPlayer = False

    def classify_node(self, data: str):

        offset = 1 if data[0] == ' ' else 0

        if " cash" in data or "considerations" in data:
            self.node_type = "cash"
        elif "rights to" in data:
            self.name = data[data.find('rights to')+10:]
            slash_index = self.name.rfind('/')
            if slash_index != -1:
                self.name = self.name[slash_index+2:]
            self.node_type = "rights"
            self.isRightsorPick = True
        elif "exception" in data or "exemption" in data:
            self.node_type = "exception"
        elif "round pick" in data or "draft pick" in data:
            if "#" in data and '-' in data and "?-?" not in data and "not exercised" not in data:
                self.name = data[data.rfind('-')+1:-1]
                slash_index = self.name.rfind('/')
                if slash_index != -1:
                    self.name = self.name[slash_index+2:]
                self.node_type = "conveyed"
                self.draft_details = data[data.index('•')+2:]
                self.isRightsorPick = True
            else:
                self.node_type = "unconveyed"
                self.draft_details = data[data.index('•')+2:]
                self.isRightsorPick = True
        elif "first refusal" in data:
            self.node_type = "first refusal"
        elif "expansion draft" in data:
            self.node_type = "expansion draft"
        else:
            if '•' in data:
                self.name = data[data.index('•')+2:]
                slash_index = self.name.rfind('/')
                if slash_index != -1:
                    self.name = self.name[slash_index+2:]
                self.node_type = "player"
                self.isPlayer = True
            else:
                self.node_type = "undef"

    def print_data(self):
        print("node data -------------------------")
        if self.name != "n/a":
            print("name: " + self.name)
        if self.node_type != "n/a":
            print("node_type: " + self.node_type)
        if self.draft_details != "n/a":
            print("draft_details: " + self.draft_details)
        print("team: " + self.team)
        print("date: " + self.date)


def get_teams_from_trade(team: str, notes: str):
    if notes[5] == "t":
        return (([team, notes[16:-5]]))
    elif notes[5] == "3":
        # print("********3 Team Trade********")
        temp = notes.replace(" ", "")
        return (([team] + temp[19:-5].split(',')))
    elif notes[5] == "4":
        # print("********4 Team Trade********")
        temp = notes.replace(" ", "")
        return (([team] + temp[19:-5].split(',')))
    elif notes[5] == "5":
        # print("********5 Team Trade********")
        temp = notes.replace(" ", "")
        return (([team] + temp[19:-5].split(',')))
    else:
        # edge cases
        after_trade_with = notes[re.search(
            r'\b(trade)\b', notes).start() + len('trade with '):]
        if ' ' in after_trade_with:
            return (([team, after_trade_with[:after_trade_with.index(' ')]]))
        else:
            return (([team, after_trade_with[:]]))


def generate_visited_key(date: str, teams: list):
    temp = sorted(teams)
    res = [date] + temp
    return '_'.join(res)


columns = ['Key', 'Date', 'From', 'To', 'Teams Involved',
           'Player Trade', 'Rights/Pick Trade']
edges = pd.DataFrame(columns=columns)
edges.to_csv('edges.csv', index=False)
ID = 0
two_team_visited = set()
many_team_visited = set()
key_player_to_team = dict()
name_to_edges = dict()
edgekey_to_data = dict()
edgekey_to_team_aquires = dict()
is_first_row = True
while URL != None:
    # for _ in range(1):
    for row in rows:
        if is_first_row:
            is_first_row = False
            continue
        cells = row.findChildren('td')
        date, team, acquired, relinq, notes = cells
        team = str(team)[5:-5]
        teams = get_teams_from_trade(team, str(notes))
        date = str(date)[20:-5]
        edge_key = [generate_visited_key(date, teams), None]
        if edge_key[0] in exempted_keys:
            continue
        nodes = [None, None]
        acquired_list = []
        relinq_list = []
        pl_involved = False
        rp_involved = False
        # Seperate two team and more than two team trades.
        # We only need to visit the first of the two team trade row
        if len(teams) == 2 and edge_key[0] not in two_team_visited:
            two_team_visited.add(edge_key[0])
            for (i, acq) in enumerate(acquired):
                if acq and str(acq) != "<br/>" and not str(acq).isspace():
                    if acq in nodes_to_revised:
                        acq = nodes_to_revised[acq]
                    nodes[0] = node(teams[0], date)
                    nodes[0].classify_node(str(acq))
                    if '•' not in acq:
                        continue
                    acquired_list += [unicodedata.normalize(
                        "NFKD", acq[acq.index('•')+2:])]
                    for rel in relinq:
                        if rel in nodes_to_revised:
                            rel = nodes_to_revised[rel]
                        if rel and str(rel) != "<br/>" and not str(rel).isspace():
                            nodes[1] = node(teams[1], date)
                            nodes[1].classify_node(str(rel))
                            if (i == (len(acquired)-1)):
                                relinq_list += [unicodedata.normalize(
                                    "NFKD", rel[rel.index('•')+2:])]
                            temp = [min(nodes[0].name, nodes[1].name), max(
                                nodes[0].name, nodes[1].name)]
                            edge_key[1] = '+'.join(temp)

                            if nodes[0].name != 'n/a' and nodes[1].name != 'n/a':
                                EK = str('='.join(edge_key))
                                pl_involved = nodes[0].isPlayer or nodes[1].isPlayer
                                rp_involved = nodes[0].isRightsorPick or nodes[1].isRightsorPick
                                edges = update_edges_csv(edges, 'edges.csv', columns,
                                                         [EK, date, nodes[0].name, nodes[1].name,
                                                          str(teams), pl_involved, rp_involved])
                                name_to_edges[nodes[0].name] = name_to_edges.get(
                                    nodes[0].name, []) + [ID]
                                name_to_edges[nodes[1].name] = name_to_edges.get(
                                    nodes[1].name, []) + [ID]
                                ID += 1
            if edge_key[0] not in edgekey_to_team_aquires:
                edgekey_to_team_aquires[edge_key[0]] = []
            edgekey_to_team_aquires[edge_key[0]].append(
                [teams[0]+" Aquire: "] + acquired_list[:])
            edgekey_to_team_aquires[edge_key[0]].append(
                [teams[1]+" Aquire: "] + relinq_list[:])
        elif len(teams) > 2:
            data = [date, team, acquired, relinq, notes]
            # Only create nodes and edges of >2 team trades once we know where each player is coming from
            # Once we visit every one of the teams we have the suitable information
            if edge_key[0] not in edgekey_to_data or len(edgekey_to_data[edge_key[0]]) < len(teams):
                for acq in acquired:
                    curr = (classify_str(str(acq)))
                    if (curr[0] == 'PL ' or curr[0] == 'RPC ' or curr[0] == 'RT ') and curr[1] != 'None':
                        key_player_to_team[(edge_key[0], curr[1])] = team
                edgekey_to_data[edge_key[0]] = edgekey_to_data.get(
                    edge_key[0], []) + [data]

            if len(edgekey_to_data[edge_key[0]]) == len(teams):
                teams = get_teams_from_trade(team, str(notes))
                for date, team, acquired, relinq, notes in edgekey_to_data[edge_key[0]]:
                    for acq in acquired:
                        if acq and str(acq) != "<br/>" and not str(acq).isspace():
                            if acq in nodes_to_revised:
                                acq = nodes_to_revised[acq]
                            nodes[0] = node(team, date)
                            nodes[0].classify_node(str(acq))
                            if '•' not in acq:
                                continue
                            acquired_list += [unicodedata.normalize(
                                "NFKD", acq[acq.index('•')+2:])]
                            for rel in relinq:
                                if rel and str(rel) != "<br/>" and not str(rel).isspace():
                                    if rel in nodes_to_revised:
                                        rel = nodes_to_revised[rel]
                                    nodes[1] = node("Unknown", date)
                                    nodes[1].classify_node(str(rel))

                                    if (edge_key[0], nodes[1].name) in key_player_to_team:
                                        nodes[1].team = key_player_to_team[(
                                            edge_key[0], nodes[1].name)]
                                    temp = [min(nodes[0].name, nodes[1].name), max(
                                        nodes[0].name, nodes[1].name)]
                                    edge_key[1] = '+'.join(temp)
                                    EK = str('='.join(edge_key))
                                    if nodes[0].name != "n/a" and nodes[1].name != "n/a" and (EK not in many_team_visited):
                                        many_team_visited.add(EK)
                                        pl_involved = nodes[0].isPlayer or nodes[1].isPlayer
                                        rp_involved = nodes[0].isRightsorPick or nodes[1].isRightsorPick
                                        edges = update_edges_csv(edges, 'edges.csv', columns, [EK, date, nodes[0].name, nodes[1].name,
                                                                                               ','.join(teams), pl_involved, rp_involved])
                                        name_to_edges[nodes[0].name] = name_to_edges.get(
                                            nodes[0].name, []) + [ID]
                                        name_to_edges[nodes[1].name] = name_to_edges.get(
                                            nodes[1].name, []) + [ID]
                                        ID += 1
                    if edge_key[0] not in edgekey_to_team_aquires:
                        edgekey_to_team_aquires[edge_key[0]] = []
                    edgekey_to_team_aquires[edge_key[0]].append(
                        [team+" Aquire: "] + acquired_list[:])
                    acquired_list = []
    next_link = soup.find(
        'div', class_='container').find_all('p')[-1].find('a')
    if next_link:
        sleep(4)
        URL = "https://prosportstransactions.com/basketball/Search/" + \
            next_link['href']
        page = requests.get(URL)
        soup = BeautifulSoup(page.content,  features="html5lib")
        table = soup.find('table')
        rows = table.findChildren(['th', 'tr'])
        is_first_row = True
    else:
        URL = None


nodes_df = pd.DataFrame(columns=['Name', 'Edges'])
for key in name_to_edges:
    df = pd.DataFrame([[key, str(name_to_edges[key])[1:-1]]],
                      columns=['Name', 'Edges'])
    nodes_df = pd.concat([nodes_df, df])
nodes_df.to_csv('nodes.csv', index=False)


trades_df = pd.DataFrame()
for key in edgekey_to_team_aquires:
    temp = [';'.join(x) for x in edgekey_to_team_aquires[key]]
    df = pd.DataFrame([[key] + temp])
    trades_df = pd.concat([trades_df, df])
trades_df.to_csv('trades.csv', index=False)
