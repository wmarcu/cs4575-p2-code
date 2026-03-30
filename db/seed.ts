import "dotenv/config";
import { db } from ".";
import { users, problems, submissions } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🌱  Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(submissions);
  await db.delete(problems);
  await db.delete(users);

  // Reset sequences
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE problems_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE submissions_id_seq RESTART WITH 1`);

  // ── 1. Users ─────────────────────────────────────────
  const insertedUsers = await db
    .insert(users)
    .values([
      { name: "Alice Johnson", email: "alice@example.com", passwordHash: "hashed_pw_1" },
      { name: "Bob Smith", email: "bob@example.com", passwordHash: "hashed_pw_2" },
      { name: "Charlie Lee", email: "charlie@example.com", passwordHash: "hashed_pw_3" },
      { name: "Diana Ross", email: "diana@example.com", passwordHash: "hashed_pw_4" },
      { name: "Eve Martinez", email: "eve@example.com", passwordHash: "hashed_pw_5" },
      { name: "Frank Brown", email: "frank@example.com", passwordHash: "hashed_pw_6" },
      { name: "Grace Kim", email: "grace@example.com", passwordHash: "hashed_pw_7" },
      { name: "Hank Davis", email: "hank@example.com", passwordHash: "hashed_pw_8" },
      { name: "Ivy Chen", email: "ivy@example.com", passwordHash: "hashed_pw_9" },
      { name: "Jack Wilson", email: "jack@example.com", passwordHash: "hashed_pw_10" },
    ])
    .returning();
  console.log(`  ✅  Inserted ${insertedUsers.length} users`);

  // ── 2. Problems ──────────────────────────────────────
  const insertedProblems = await db
    .insert(problems)
    .values([
      {
        title: "Two Sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "easy" as const,
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
        ],
        functionName: "two_sum",
        testCases: [
          { args: [[...Array(5000).fill(1).map((_, i) => i > 4995 ? i : 1), 2, 7], 9], expected: [5000, 5001] },
          { args: [[2,7,11,15], 9], expected: [0, 1] },
          { args: [[3,2,4], 6], expected: [1, 2] },
          { args: [[3,3], 6], expected: [0, 1] },
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        starterCode: `def two_sum(nums, target):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(n)"
        },
      },
      {
        title: "FizzBuzz",
        description:
          "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, answer[i] == 'Fizz' if i is divisible by 3, answer[i] == 'Buzz' if i is divisible by 5, answer[i] == i (as a string) otherwise.",
        difficulty: "easy" as const,
        examples: [
          { input: "n = 3", output: '["1","2","Fizz"]' },
          { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' },
        ],
        functionName: "fizz_buzz",
        testCases: [
          { args: [3], expected: ["1", "2", "Fizz"] },
          { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
          { args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
        ],
        constraints: ["1 <= n <= 10^4"],
        starterCode: `def fizz_buzz(n):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "Reverse String",
        description:
          "Write a function that reverses a list of characters in-place and returns it.",
        difficulty: "easy" as const,
        examples: [
          { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
          { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
        ],
        functionName: "reverse_string",
        testCases: [
          { args: [["h","e","l","l","o"]], expected: ["o","l","l","e","h"] },
          { args: [["H","a","n","n","a","h"]], expected: ["h","a","n","n","a","H"] },
          { args: [["a"]], expected: ["a"] },
        ],
        constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
        starterCode: `def reverse_string(s):
    # Reverse the list in-place and return it
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "Palindrome Number",
        description: "Given an integer x, return True if x is a palindrome, and False otherwise.",
        difficulty: "easy" as const,
        examples: [
          { input: "x = 121", output: "True", explanation: "121 reads as 121 from left to right and from right to left." },
          { input: "x = -121", output: "False", explanation: "From left to right, it reads -121. From right to left it becomes 121-. Therefore it is not a palindrome." },
        ],
        functionName: "is_palindrome",
        testCases: [
          { args: [121], expected: true },
          { args: [-121], expected: false },
          { args: [10], expected: false },
          { args: [0], expected: true },
        ],
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        starterCode: `def is_palindrome(x):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(log(n))",
          space: "O(1)"
        },
      },
      {
        title: "Valid Parentheses",
        description:
          "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type and in the correct order.",
        difficulty: "easy" as const,
        examples: [
          { input: 's = "()"', output: "True" },
          { input: 's = "()[]{}"', output: "True" },
          { input: 's = "(]"', output: "False" },
        ],
        functionName: "is_valid",
        testCases: [
          { args: ["()"], expected: true },
          { args: ["()[]{}"], expected: true },
          { args: ["(]"], expected: false },
          { args: ["([)]"], expected: false },
          { args: ["{[]}"], expected: true },
        ],
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
        starterCode: `def is_valid(s):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(n)"
        },
      },
      {
        title: "Maximum Subarray",
        description:
          "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        difficulty: "medium" as const,
        examples: [
          { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
          { input: "nums = [1]", output: "1" },
        ],
        functionName: "max_sub_array",
        testCases: [
          { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
          { args: [[1]], expected: 1 },
          { args: [[5,4,-1,7,8]], expected: 23 },
          { args: [[-1]], expected: -1 },
        ],
        constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        starterCode: `def max_sub_array(nums):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "Merge Two Sorted Lists",
        description:
          "You are given two sorted lists. Merge them into one sorted list and return it.",
        difficulty: "easy" as const,
        examples: [
          { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
          { input: "list1 = [], list2 = []", output: "[]" },
        ],
        functionName: "merge_two_lists",
        testCases: [
          { args: [[1,2,4], [1,3,4]], expected: [1,1,2,3,4,4] },
          { args: [[], []], expected: [] },
          { args: [[], [0]], expected: [0] },
        ],
        constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"],
        starterCode: `def merge_two_lists(list1, list2):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(m + n)",
          space: "O(m + n)"
        },
      },
      {
        title: "Climbing Stairs",
        description:
          "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "easy" as const,
        examples: [
          { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step  2. 2 steps" },
          { input: "n = 3", output: "3", explanation: "1. 1+1+1  2. 1+2  3. 2+1" },
        ],
        functionName: "climb_stairs",
        testCases: [
          { args: [2], expected: 2 },
          { args: [3], expected: 3 },
          { args: [4], expected: 5 },
          { args: [5], expected: 8 },
        ],
        constraints: ["1 <= n <= 45"],
        starterCode: `def climb_stairs(n):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "Best Time to Buy and Sell Stock",
        description:
          "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a single day to sell. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.",
        difficulty: "easy" as const,
        examples: [
          { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
          { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No transactions are done since prices only decrease." },
        ],
        functionName: "max_profit",
        testCases: [
          { args: [[7,1,5,3,6,4]], expected: 5 },
          { args: [[7,6,4,3,1]], expected: 0 },
          { args: [[1,2]], expected: 1 },
          { args: [[2,4,1]], expected: 2 },
        ],
        constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        starterCode: `def max_profit(prices):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "Container With Most Water",
        description:
          "You are given an integer array height of length n. There are n vertical lines drawn. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
        difficulty: "medium" as const,
        examples: [
          { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The max area is between lines at index 1 and 8." },
          { input: "height = [1,1]", output: "1" },
        ],
        functionName: "max_area",
        testCases: [
          { args: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
          { args: [[1,1]], expected: 1 },
          { args: [[4,3,2,1,4]], expected: 16 },
        ],
        constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        starterCode: `def max_area(height):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(1)"
        },
      },
      {
        title: "3Sum",
        description:
          "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
        difficulty: "medium" as const,
        examples: [
          { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
          { input: "nums = [0,1,1]", output: "[]" },
        ],
        functionName: "three_sum",
        testCases: [
          { args: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] },
          { args: [[0,1,1]], expected: [] },
          { args: [[0,0,0]], expected: [[0,0,0]] },
        ],
        constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        starterCode: `def three_sum(nums):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)"
        },
      },
      {
        title: "Longest Substring Without Repeating Characters",
        description:
          "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "medium" as const,
        examples: [
          { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
          { input: 's = "bbbbb"', output: "1" },
        ],
        functionName: "length_of_longest_substring",
        testCases: [
          { args: ["abcabcbb"], expected: 3 },
          { args: ["bbbbb"], expected: 1 },
          { args: ["pwwkew"], expected: 3 },
          { args: [""], expected: 0 },
        ],
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        starterCode: `def length_of_longest_substring(s):
    # Write your solution here
    pass`,
        complexity: {
          time: "O(n)",
          space: "O(n)"
        },
      },
    ])
    .returning();
  console.log(`  ✅  Inserted ${insertedProblems.length} problems`);

  // ── 3. Submissions ───────────────────────────────────
  // Generate sample submissions: random users × random problems × random energy values
  const submissionRows: {
    userId: number;
    problemId: number;
    energyConsumption: number;
    code: string;
  }[] = [];

  for (let i = 0; i < 40; i++) {
    const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
    const problem = insertedProblems[Math.floor(Math.random() * insertedProblems.length)];
    submissionRows.push({
      userId: user.id,
      problemId: problem.id,
      energyConsumption: parseFloat((Math.random() * 100 + 1).toFixed(2)), // 1–101 J
      code: `# Sample submission by ${user.name} for ${problem.title}\nprint("hello world")`,
    });
  }

  const insertedSubmissions = await db
    .insert(submissions)
    .values(submissionRows)
    .returning();
  console.log(`  ✅  Inserted ${insertedSubmissions.length} submissions`);

  console.log("🎉  Seeding completed!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });