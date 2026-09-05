export const chapter04 = {
  id: 'ch04',
  number: 4,
  title: 'Mind Body Management (Intermediate)',
  subtitle: 'Dream Control and Energizing',
  sections: [
    {
      id: 'dream-control',
      title: 'Dream Control',
      kicker: 'Section 1',
      blocks: [
        { type: 'quote', text: 'The happiest part of a man\'s life is what he passes lying awake in bed in the morning.', author: 'Samuel Johnson' },
        {
          type: 'prose',
          text: [
            'Here at the Silva Method we believe dreams can carry messages from deeper parts of your mind and help you solve problems. The Dream Control Technique has two main purposes: to use your dreams to interpret information, and to solve problems.',
          ],
        },
        { type: 'exercise-header', title: 'The 3 phases of Dream Control mastery' },
        {
          type: 'phases',
          items: [
            { label: 'Beginner', text: 'Remember a dream. This step helps you establish the habit of transferring information from the inner conscious levels to the outer conscious levels. Write down the notes as soon as you wake. Keep pen and paper (or a dream journal) by the bedside.' },
            { label: 'Intermediate', text: 'Remember dreams consistently. You should be remembering dreams each night as you intend, and documenting them in the morning.' },
            { label: 'Advanced', text: 'Remember a dream AND interpret its meaning to solve a problem. Before you go to sleep, ask for the solution to come to you in the dream. When you wake, ask "How does that relate to my problem?" — allow thoughts to surface, let your inner conscious help, then apply the solution.' },
          ],
        },
        {
          type: 'audio-placeholder',
          title: 'Dream Control programming',
          description: 'The guided audio for the technique.',
        },
        {
          type: 'journal',
          id: 'dream-journal',
          title: 'Dream journal',
          prompt: 'Date, what you remember, the feeling of it. If you asked for a solution before sleep, what came through?',
          placeholder: 'Last night I dreamed…',
        },
      ],
    },
    {
      id: 'energizing',
      title: 'Energizing Exercise',
      kicker: 'Section 2',
      blocks: [
        { type: 'quote', text: 'The more you lose yourself in something bigger than yourself, the more energy you will have.', author: 'Norman Vincent Peale' },
        {
          type: 'prose',
          text: 'The Energizing Technique helps you remain awake longer when necessary, but it doesn\'t stop there — it can be used to re-energize, change a mood, or shift your state in any creative way. Be sure to self-evaluate before and after.',
        },
        { type: 'callout', label: 'Important', text: 'Anytime you use any Silva technique for health problems, notify your health caretaker or physician.' },
        { type: 'exercise-header', title: 'Self-evaluation' },
        {
          type: 'evaluation',
          id: 'energy-eval',
          title: 'Energy level',
          intro: 'On a scale of 0–10 (10 = outstanding, super-energized), rate your current energy level.',
          phases: [
            { id: 'before', label: 'Before' },
            { id: 'after', label: 'After' },
          ],
          items: [{ id: 'energy', text: 'How do you currently rank your level of energy?', min: 0, max: 10 }],
        },
        { type: 'exercise-header', title: 'Energizing Technique' },
        {
          type: 'audio-placeholder',
          title: 'Energizing programming',
          description: 'The guided audio for the 5-step technique.',
        },
        {
          type: 'steps',
          items: [
            { text: 'Close your eyes and use the 3-to-1 Method to reach your Alpha level.' },
            { text: 'State the problem: "I am tired."' },
            { text: 'State the goal: "I don\'t want to be tired — I want to be energized and awake."' },
            { text: 'State your action: "I am going to count from 1 to 5, open my eyes and feel amazing, energized, and alert."' },
            { text: 'Take action: open your eyes, claim and appreciate your results.' },
          ],
        },
        { type: 'callout', label: 'Note', text: 'You can take 2 minutes, 5, 10, or longer. The most important thing is that you make a point of reference when you use it most effectively for you.' },
      ],
    },
  ],
};
