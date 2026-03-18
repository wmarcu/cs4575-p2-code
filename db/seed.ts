import "dotenv/config";
import { db } from ".";
import { users, problems, submissions } from "./schema";

async function main() {
  console.log("🌱  Seeding database...");

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
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        starterCode: `class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution here\n        pass`,
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
        constraints: ["1 <= n <= 10^4"],
        starterCode: `class Solution:\n    def fizzBuzz(self, n):\n        # Write your solution here\n        pass`,
      },
      {
        title: "Reverse String",
        description:
          "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "easy" as const,
        examples: [
          { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
          { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
        ],
        constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
        starterCode: `class Solution:\n    def reverseString(self, s):\n        # Modify s in-place\n        pass`,
      },
      {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        difficulty: "easy" as const,
        examples: [
          { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
          { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left it becomes 121-. Therefore it is not a palindrome." },
        ],
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        starterCode: `class Solution:\n    def isPalindrome(self, x):\n        # Write your solution here\n        pass`,
      },
      {
        title: "Valid Parentheses",
        description:
          "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type and in the correct order.",
        difficulty: "easy" as const,
        examples: [
          { input: 's = "()"', output: "true" },
          { input: 's = "()[]{}"', output: "true" },
          { input: 's = "(]"', output: "false" },
        ],
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
        starterCode: `class Solution:\n    def isValid(self, s):\n        # Write your solution here\n        pass`,
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
        constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        starterCode: `class Solution:\n    def maxSubArray(self, nums):\n        # Write your solution here\n        pass`,
      },
      {
        title: "Merge Two Sorted Lists",
        description:
          "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        difficulty: "easy" as const,
        examples: [
          { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
          { input: "list1 = [], list2 = []", output: "[]" },
        ],
        constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"],
        starterCode: `class Solution:\n    def mergeTwoLists(self, list1, list2):\n        # Write your solution here\n        pass`,
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
        constraints: ["1 <= n <= 45"],
        starterCode: `class Solution:\n    def climbStairs(self, n):\n        # Write your solution here\n        pass`,
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
        constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        starterCode: `class Solution:\n    def maxProfit(self, prices):\n        # Write your solution here\n        pass`,
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
        constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        starterCode: `class Solution:\n    def maxArea(self, height):\n        # Write your solution here\n        pass`,
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
        constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        starterCode: `class Solution:\n    def threeSum(self, nums):\n        # Write your solution here\n        pass`,
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
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        starterCode: `class Solution:\n    def lengthOfLongestSubstring(self, s):\n        # Write your solution here\n        pass`,
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