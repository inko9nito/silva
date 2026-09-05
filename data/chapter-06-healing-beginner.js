export const chapter06 = {
  id: 'ch06',
  number: 6,
  title: 'Healing & Problem Solving (Beginner)',
  subtitle: 'Glass of Water and Headache Relief',
  sections: [
    {
      id: 'glass-of-water',
      title: 'Glass of Water',
      kicker: 'Section 1',
      blocks: [
        { type: 'quote', text: 'Life begets life. Energy creates energy. It is by spending oneself that one becomes rich.', author: 'Sarah Bernhardt' },
        {
          type: 'prose',
          text: 'This is a fun exercise for solving problems and even bringing healing. We recommend a clear drinking glass — glass is a natural element, and we want to work with that natural element.',
        },
        { type: 'exercise-header', title: 'Glass of Water Technique' },
        {
          type: 'steps',
          items: [
            { text: 'Regardless of how big or small the problem may be, use a simple drinking glass and fill it with water.' },
            { text: 'Take it to your bedside. As the last thing you do before sleep, close your eyes, tilt them slightly upward and say mentally, "This is all I need to do to find the solution to the problem I have in mind." Drink some of the water. Set the remaining half glass aside, go to bed, and enter sleep.', note: 'You don\'t need the 3 to 1 Method here. You enter level when you close your eyes and tilt them slightly upward.' },
            { text: 'In the morning, get the remaining half glass. Close your eyes again, tilt them slightly upward, and mentally say, "This is all I need to do to find the solution to the problem I have in mind."', note: 'Have the problem in mind when you go to sleep — that incubates the thought all night.' },
            { text: 'Document everything. When you wake you may have flashes of insight or a vivid dream. All of it holds insight into the problem.' },
          ],
        },
        {
          type: 'prose',
          text: [
            'You must still drink the remaining half glass — that\'s how the formula is programmed. Instead of the original statement, you may want to say words of gratitude for receiving the information.',
            'If the answer doesn\'t come right away in the morning, expect it later in the day. It may arrive as a flash of insight, a book open to the right page, or a passing conversation. Keep your intent on the receiving mode — you will see, hear, or experience it in some form.',
          ],
        },
        {
          type: 'journal',
          id: 'gow-problem',
          title: 'Problem I\'m holding in mind',
          prompt: 'What is the problem you are inviting a solution to?',
        },
        {
          type: 'journal',
          id: 'gow-morning',
          title: 'Morning insight',
          prompt: 'Dreams, images, thoughts, phrases you woke with.',
        },
        {
          type: 'journal',
          id: 'gow-day',
          title: 'Insight during the day',
          prompt: 'What arrived later — a book, a conversation, a felt sense?',
        },
      ],
    },
    {
      id: 'headache-relief',
      title: 'Headache Relief',
      kicker: 'Section 2',
      blocks: [
        { type: 'quote', text: 'A man\'s health can be judged by which he takes two at a time — pills or stairs.', author: 'Joan Welsh' },
        { type: 'callout', label: 'Important', text: 'If you experience a recurring headache, consult with your physician before using this exercise. Better safe than sorry when ruling out other medical conditions.' },
        { type: 'exercise-header', title: 'Self-evaluation' },
        {
          type: 'evaluation',
          id: 'headache-eval',
          title: 'Headache intensity',
          intro: 'On a scale of 0–10 (0 = no pain at all), rate the sensation of pain or stress in your head.',
          phases: [
            { id: 'before', label: 'Before' },
            { id: 'after', label: 'After' },
          ],
          items: [{ id: 'pain', text: 'Rate the sensation in your head.', min: 0, max: 10 }],
        },
        { type: 'exercise-header', title: 'Headache Control Technique' },
        {
          type: 'audio-placeholder',
          title: 'Headache Relief programming',
          description: 'The guided audio for the 5-step technique.',
        },
        {
          type: 'steps',
          items: [
            { text: 'Identify the problem: "I have a headache, I feel a headache."' },
            { text: 'State what you desire: "I don\'t want to have a headache, I don\'t want to feel a headache."' },
            { text: 'Lay out your plan: "I\'m going to count from one to five. At the count of five I will open my eyes, be wide awake, feeling fine and in perfect health. I will then have no headache. I will then feel no headache."', note: 'Notice "have" and "feel" — the physical pain and the subjective experience of it.' },
            { text: 'Carry out your plan. One… two… (coming out slowly)… three (remind yourself of the goal at three)… four… five. At five, claim your end results: "Eyes opened, wide awake, feeling fine and in perfect health, feeling better than before."' },
            { text: 'Claim your results. The next time you begin to feel a sensation, do it again — even if it\'s 20 times in one day. The body is relearning to go toward relief instead of toward the headache.' },
          ],
        },
        {
          type: 'prose',
          text: [
            'For a serious headache already in progress: apply the technique, open your eyes, wait five minutes, apply it again. For a migraine: enter level with the 3 to 1 Method, apply the 5-step process, open your eyes, wait exactly five minutes (not six, not three — five), apply it again, wait five minutes, apply a third time.',
            'The first application takes care of some symptoms; the second removes most; the third removes all. Keep following the formula.',
          ],
        },
      ],
    },
  ],
};
