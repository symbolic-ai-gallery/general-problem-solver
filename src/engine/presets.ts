import type { Operator, Preset } from "./types";
const op = (
  action: string,
  preconds: string[],
  add: string[],
  del: string[] = [],
): Operator => ({ action, preconds, add, delete: del });
export const presets: Preset[] = [
  {
    id: "monkey",
    title: ["猴子与香蕉", "Monkey and bananas"],
    problem: {
      start: ["at door", "on floor", "has ball", "hungry", "chair at door"],
      finish: ["not hungry"],
      ops: [
        op(
          "climb on chair",
          ["chair at middle room", "at middle room", "on floor"],
          ["at bananas", "on chair"],
          ["at middle room", "on floor"],
        ),
        op(
          "push chair from door to middle room",
          ["chair at door", "at door"],
          ["chair at middle room", "at middle room"],
          ["chair at door", "at door"],
        ),
        op(
          "walk from door to middle room",
          ["at door", "on floor"],
          ["at middle room"],
          ["at door"],
        ),
        op(
          "grasp bananas",
          ["at bananas", "empty handed"],
          ["has bananas"],
          ["empty handed"],
        ),
        op("drop ball", ["has ball"], ["empty handed"], ["has ball"]),
        op(
          "eat bananas",
          ["has bananas"],
          ["empty handed", "not hungry"],
          ["has bananas", "hungry"],
        ),
      ],
    },
  },
  {
    id: "school",
    title: ["送孩子上学", "Getting to school"],
    problem: {
      start: [
        "child at home",
        "car needs battery",
        "have money",
        "have phone book",
      ],
      finish: ["child at school"],
      ops: [
        op(
          "drive to school",
          ["child at home", "car works"],
          ["child at school"],
          ["child at home"],
        ),
        op(
          "install battery",
          ["car needs battery", "shop knows problem", "shop has money"],
          ["car works"],
          ["car needs battery"],
        ),
        op(
          "tell shop the problem",
          ["in contact with shop"],
          ["shop knows problem"],
        ),
        op("telephone shop", ["know phone number"], ["in contact with shop"]),
        op("look up phone number", ["have phone book"], ["know phone number"]),
        op(
          "pay shop",
          ["have money", "in contact with shop"],
          ["shop has money"],
          ["have money"],
        ),
      ],
    },
  },
  {
    id: "maze",
    title: ["路线规划", "Route planning"],
    problem: {
      start: ["at A"],
      finish: ["at F"],
      ops: [
        ["A", "B"],
        ["B", "C"],
        ["B", "D"],
        ["D", "E"],
        ["E", "F"],
      ].flatMap(([a, b]) => [
        op("move " + a + " → " + b, ["at " + a], ["at " + b], ["at " + a]),
        op("move " + b + " → " + a, ["at " + b], ["at " + a], ["at " + b]),
      ]),
    },
  },
  {
    id: "ordering",
    title: ["目标顺序", "Goal ordering"],
    problem: {
      start: ["have token"],
      finish: ["have meal", "have ticket"],
      ops: [
        op(
          "redeem token for meal",
          ["have token"],
          ["have meal"],
          ["have token"],
        ),
        op("show token for ticket", ["have token"], ["have ticket"]),
      ],
    },
  },
];
const zhLabels: Record<string, string> = {
  "at door": "在门口",
  "on floor": "在地面",
  "has ball": "拿着球",
  hungry: "饥饿",
  "chair at door": "椅子在门口",
  "not hungry": "不再饥饿",
  "chair at middle room": "椅子在房间中央",
  "at middle room": "在房间中央",
  "at bananas": "够得到香蕉",
  "on chair": "在椅子上",
  "empty handed": "空手",
  "has bananas": "拿着香蕉",
  "climb on chair": "爬上椅子",
  "push chair from door to middle room": "把椅子推到房间中央",
  "walk from door to middle room": "走到房间中央",
  "grasp bananas": "拿到香蕉",
  "drop ball": "放下球",
  "eat bananas": "吃掉香蕉",
  "child at home": "孩子在家",
  "car needs battery": "汽车需要电池",
  "have money": "有钱",
  "have phone book": "有电话簿",
  "child at school": "孩子在学校",
  "car works": "汽车可用",
  "shop knows problem": "修理厂知道故障",
  "shop has money": "修理厂已收款",
  "in contact with shop": "已联系修理厂",
  "know phone number": "知道电话号码",
  "drive to school": "开车送孩子上学",
  "install battery": "安装电池",
  "tell shop the problem": "告知汽车故障",
  "telephone shop": "致电修理厂",
  "look up phone number": "查找电话号码",
  "pay shop": "向修理厂付款",
  "have token": "持有凭证",
  "have meal": "获得餐食",
  "have ticket": "获得入场券",
  "redeem token for meal": "交出凭证换餐食",
  "show token for ticket": "出示凭证领入场券",
};
export const label = (text: string, zh = true) =>
  zh ? (zhLabels[text] ?? text) : text;
