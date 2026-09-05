const sleepEvalItems = [
  { id: 'well', text: 'How well do you sleep?' },
  { id: 'rested', text: 'Do you wake up feeling rested?' },
  { id: 'hours', text: 'How many hours do you average per night?' },
  { id: 'fall', text: 'How long does it take you to fall asleep each night?' },
  { id: 'feel', text: 'How do you feel about sleep?' },
  { id: 'most', text: 'Do you sleep well most nights?' },
  { id: 'meds', text: 'Are you on medication?' },
  { id: 'chronic', text: 'Do you have a chronic problem?' },
  { id: 'through', text: 'How many nights a week do you sleep soundly all the way through?' },
];

const desiredSleepItems = [
  { id: 'want', text: 'How do you want to sleep?' },
  { id: 'know', text: 'How will you know if you are sleeping well enough?' },
  { id: 'quickly', text: 'How quickly do you fall asleep?' },
  { id: 'deep', text: 'How deeply do you want to sleep each night?' },
  { id: 'wake', text: 'How do you want to feel when you wake up?' },
];

export const chapter03 = {
  id: 'ch03',
  number: 3,
  title: 'Mind Body Management (Beginner)',
  subtitle: 'Sleep Control and Alarm Clock',
  sections: [
    {
      id: 'sleep-control',
      title: 'Sleep Control',
      kicker: 'Section 1',
      blocks: [
        { type: 'quote', text: 'Healing takes courage, and we all have courage, even if we have to dig a little to find it.', author: 'Tori Amos' },
        {
          type: 'prose',
          text: 'This technique will work best if you focus your attention on the details. It takes your mind away from whatever is keeping you awake — the outside influences or mental chatter about deadlines, meetings, problems, car payments. Focus on the details: not erasing the circle in the least, erasing the numbers from center to outer edge, going over the word "deeper" letter by letter — d-e-e-p-e-r — over and over. That helps you get bored, lose interest, and enter sleep.',
        },

        { type: 'exercise-header', title: 'Sleep evaluation' },
        {
          type: 'prose',
          text: 'Rate each item from 1 to 10 (10 = very well). Score yourself now (Current), how you want it (Desired), and later after practicing (Improved).',
        },
        {
          type: 'evaluation',
          id: 'sleep-eval',
          title: 'Sleep — how you rate yourself',
          phases: [
            { id: 'current', label: 'Current' },
            { id: 'improved', label: 'Improved' },
          ],
          items: sleepEvalItems,
        },
        {
          type: 'evaluation',
          id: 'desired-sleep',
          title: 'Desired sleep',
          items: desiredSleepItems,
        },

        { type: 'exercise-header', title: 'Sleep Control Technique' },
        {
          type: 'audio-placeholder',
          title: 'Sleep Control programming',
          description: 'The guided audio for this technique.',
        },
        {
          type: 'steps',
          items: [
            { text: 'Visualize yourself standing in front of a chalkboard or writing board. You have a writing instrument in one hand and an eraser in the other. Draw a large circle in the center of the board.' },
            { text: 'Draw a big "X" within the circle.' },
            { text: 'Erase the "X" from within the circle, being very careful not to erase the circle in the least.' },
            { text: 'Outside the circle, to the right, write the word "deeper". Every time you write "deeper" you enter a deeper, healthier level of mind in the direction of normal, natural, healthy sleep.' },
            { text: 'Write a big number "100" within the circle, then slowly erase it — careful not to erase the circle — then go over "deeper" again.' },
            { text: 'Continue with 99, then 98, 97, and so on. Write the number, erase it carefully, then go over "deeper", on a descending scale until you enter sleep.' },
          ],
        },
        {
          type: 'journal',
          title: 'Sleep Control notes',
          prompt: 'What did you notice as you practiced? Which detail helped you drop off — the erasing, the "deeper", the numbers? Any adjustments to try next time?',
        },
      ],
    },
    {
      id: 'alarm-clock',
      title: 'Alarm Clock',
      kicker: 'Section 2',
      blocks: [
        { type: 'callout', label: 'Tip', text: 'Applying your technique out of need, rather than curiosity, will always lead to greater success.' },
        {
          type: 'prose',
          text: [
            'This is a fun exercise that shows results right away. If you dread the sound of the alarm, you are going to love this technique — it is designed so that you will never need your alarm clock again.',
            'It has two purposes: teaching you to sleep and wake within your body\'s natural sleep cycles, and reinforcing your ability as an intentional creator. Each time you complete it successfully, you strengthen your natural ability to manifest.',
          ],
        },
        { type: 'exercise-header', title: 'Alarm Clock Technique' },
        {
          type: 'audio-placeholder',
          title: 'Alarm Clock programming',
          description: 'The guided audio for this technique.',
        },
        {
          type: 'steps',
          items: [
            { text: 'Enter Alpha level using the 3 to 1 Method.' },
            { text: 'Once at Alpha level, visualize a clock.' },
            { text: 'Move the hands of the clock to the time you want to awaken. Say to yourself mentally, in a very affirmative way: "This is the time I want to awaken, and this is the time I am going to awaken."', note: 'Make a clear picture of the clock and the time; let that be your last thought as you enter sleep from level 1.' },
          ],
        },
        {
          type: 'prose',
          text: 'Don\'t set a physical alarm clock — not even as a backup. You may keep your clock nearby without an alarm set. This shows commitment and belief in your inner self.',
        },
        {
          type: 'phases',
          items: [
            { label: 'Beginner', text: 'Get close to your goal. You might awaken several times during the night to check the clock ("Is it time yet?"). That\'s only proof that intelligence is working for you. Don\'t worry — it clears up.' },
            { label: 'Intermediate', text: 'Hit your target consistently — e.g. 7:30 a.m. each day. If you want 7:30, don\'t settle for 7:35 or 7:45. Your goal is to manifest what you desire, at the specific time you set.' },
            { label: 'Advanced', text: 'Change the target each day and hit it accurately. If you\'re hitting 7:00 a.m., try 7:02 a.m. In a couple of days you\'ll find that whether you say 7:30 or 6:42, you\'ll awaken at exactly that time.' },
          ],
        },
        {
          type: 'journal',
          title: 'Alarm Clock log',
          prompt: 'Date, time you set, time you woke. Note anything surprising — half-wakes to check the clock, mood on waking, etc.',
        },
      ],
    },
  ],
};
