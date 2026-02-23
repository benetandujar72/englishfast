import { db } from "@/server/db";

const FCE_VOCABULARY = [
  { word: "accomplish", definition: "to succeed in doing something", exampleSent: "She accomplished her goal of running a marathon.", translation: "lograr", category: "Academic", difficulty: 3 },
  { word: "acknowledge", definition: "to accept or admit something is true", exampleSent: "He acknowledged his mistake and apologized.", translation: "reconocer", category: "Academic", difficulty: 3 },
  { word: "adequate", definition: "enough or satisfactory for a purpose", exampleSent: "The hotel room was adequate but not luxurious.", translation: "adecuado", category: "Academic", difficulty: 3 },
  { word: "anticipate", definition: "to expect or predict something", exampleSent: "We didn't anticipate such a large crowd.", translation: "anticipar", category: "Academic", difficulty: 3 },
  { word: "appropriate", definition: "suitable or proper for a situation", exampleSent: "Is this dress appropriate for the interview?", translation: "apropiado", category: "Academic", difficulty: 2 },
  { word: "approximately", definition: "close to an exact amount but not completely", exampleSent: "There were approximately 200 people at the event.", translation: "aproximadamente", category: "Academic", difficulty: 2 },
  { word: "assess", definition: "to judge or decide the quality of something", exampleSent: "The teacher will assess your progress at the end of term.", translation: "evaluar", category: "Academic", difficulty: 3 },
  { word: "assume", definition: "to think something is true without proof", exampleSent: "Don't assume he's guilty without evidence.", translation: "asumir", category: "Academic", difficulty: 2 },
  { word: "benefit", definition: "an advantage or something positive", exampleSent: "Regular exercise has many health benefits.", translation: "beneficio", category: "Academic", difficulty: 2 },
  { word: "circumstance", definition: "a fact or condition connected with an event", exampleSent: "Under the circumstances, I think we should cancel.", translation: "circunstancia", category: "Academic", difficulty: 3 },
  { word: "awkward", definition: "causing embarrassment or difficulty", exampleSent: "There was an awkward silence after his comment.", translation: "incómodo", category: "Everyday", difficulty: 3 },
  { word: "bargain", definition: "something bought cheaply; to negotiate a price", exampleSent: "This jacket was a real bargain at half price.", translation: "ganga", category: "Everyday", difficulty: 3 },
  { word: "commute", definition: "to travel regularly between home and work", exampleSent: "I commute by train every day.", translation: "ir y venir al trabajo", category: "Everyday", difficulty: 3 },
  { word: "cope", definition: "to deal with something difficult", exampleSent: "How do you cope with stress at work?", translation: "hacer frente", category: "Everyday", difficulty: 3 },
  { word: "crucial", definition: "extremely important or necessary", exampleSent: "Timing is crucial in this business.", translation: "crucial", category: "Everyday", difficulty: 3 },
  { word: "deliberately", definition: "on purpose, intentionally", exampleSent: "She deliberately ignored my email.", translation: "deliberadamente", category: "Everyday", difficulty: 3 },
  { word: "deserve", definition: "to earn something by actions or qualities", exampleSent: "You deserve a break after all that hard work.", translation: "merecer", category: "Everyday", difficulty: 2 },
  { word: "enthusiastic", definition: "showing eager enjoyment or interest", exampleSent: "The audience was enthusiastic about the performance.", translation: "entusiasta", category: "Everyday", difficulty: 3 },
  { word: "eventually", definition: "in the end, after a period of time", exampleSent: "We eventually found the restaurant after getting lost.", translation: "finalmente", category: "Everyday", difficulty: 2 },
  { word: "grateful", definition: "feeling or showing thanks", exampleSent: "I'm grateful for your help.", translation: "agradecido", category: "Everyday", difficulty: 2 },
  { word: "break down", definition: "to stop working (machine); to lose emotional control", exampleSent: "The car broke down on the motorway.", translation: "averiarse", category: "Phrasal Verbs", difficulty: 3 },
  { word: "bring up", definition: "to mention a topic; to raise a child", exampleSent: "She was brought up in a small village.", translation: "criar / mencionar", category: "Phrasal Verbs", difficulty: 3 },
  { word: "carry out", definition: "to complete or perform a task", exampleSent: "The researchers carried out a detailed study.", translation: "llevar a cabo", category: "Phrasal Verbs", difficulty: 3 },
  { word: "come across", definition: "to find by chance; to appear to be", exampleSent: "I came across an interesting article online.", translation: "encontrarse con", category: "Phrasal Verbs", difficulty: 3 },
  { word: "deal with", definition: "to handle or manage a situation", exampleSent: "How do you deal with difficult customers?", translation: "lidiar con", category: "Phrasal Verbs", difficulty: 2 },
  { word: "figure out", definition: "to understand or solve something", exampleSent: "I can't figure out how to use this app.", translation: "descifrar", category: "Phrasal Verbs", difficulty: 3 },
  { word: "get along", definition: "to have a good relationship with someone", exampleSent: "Do you get along with your colleagues?", translation: "llevarse bien", category: "Phrasal Verbs", difficulty: 2 },
  { word: "give up", definition: "to stop trying or stop a habit", exampleSent: "He gave up smoking last year.", translation: "rendirse / dejar", category: "Phrasal Verbs", difficulty: 2 },
  { word: "look forward to", definition: "to feel excited about something future", exampleSent: "I'm looking forward to the holiday.", translation: "tener ganas de", category: "Phrasal Verbs", difficulty: 2 },
  { word: "put off", definition: "to postpone; to discourage someone", exampleSent: "Don't put off going to the dentist.", translation: "posponer", category: "Phrasal Verbs", difficulty: 3 },
  { word: "make a decision", definition: "to decide something", exampleSent: "We need to make a decision by Friday.", translation: "tomar una decisión", category: "Collocations", difficulty: 2 },
  { word: "make an effort", definition: "to try hard to do something", exampleSent: "Please make an effort to arrive on time.", translation: "hacer un esfuerzo", category: "Collocations", difficulty: 2 },
  { word: "take advantage", definition: "to use an opportunity or situation", exampleSent: "Take advantage of the sale while it lasts.", translation: "aprovechar", category: "Collocations", difficulty: 3 },
  { word: "take into account", definition: "to consider something when making a decision", exampleSent: "We must take the cost into account.", translation: "tener en cuenta", category: "Collocations", difficulty: 3 },
  { word: "draw a conclusion", definition: "to form an opinion based on evidence", exampleSent: "What conclusions can we draw from the data?", translation: "sacar una conclusión", category: "Collocations", difficulty: 4 },
  { word: "raise awareness", definition: "to make people more informed about something", exampleSent: "The campaign aims to raise awareness about recycling.", translation: "concienciar", category: "Collocations", difficulty: 3 },
  { word: "catch someone's attention", definition: "to make someone notice you or something", exampleSent: "The bright colours caught my attention.", translation: "llamar la atención", category: "Collocations", difficulty: 3 },
  { word: "meet a deadline", definition: "to finish something by the required time", exampleSent: "We're working hard to meet the deadline.", translation: "cumplir un plazo", category: "Collocations", difficulty: 3 },
  { word: "reach an agreement", definition: "to come to a mutual decision", exampleSent: "After hours of negotiation, they reached an agreement.", translation: "llegar a un acuerdo", category: "Collocations", difficulty: 3 },
  { word: "face a challenge", definition: "to deal with something difficult", exampleSent: "The company is facing major challenges this year.", translation: "enfrentar un desafío", category: "Collocations", difficulty: 3 },
  { word: "actually", definition: "in fact, really (NOT 'actualmente')", exampleSent: "I actually prefer tea to coffee.", translation: "en realidad (no 'actualmente')", category: "False Friends", difficulty: 4 },
  { word: "currently", definition: "at the present time (= 'actualmente')", exampleSent: "She is currently working from home.", translation: "actualmente", category: "False Friends", difficulty: 3 },
  { word: "sensible", definition: "having good judgement (NOT 'sensible')", exampleSent: "It would be sensible to bring an umbrella.", translation: "sensato (no 'sensible')", category: "False Friends", difficulty: 4 },
  { word: "sensitive", definition: "easily affected emotionally (= 'sensible')", exampleSent: "He's very sensitive about his weight.", translation: "sensible", category: "False Friends", difficulty: 3 },
  { word: "pretend", definition: "to act as if something is true when it isn't", exampleSent: "She pretended to be asleep.", translation: "fingir (no 'pretender')", category: "False Friends", difficulty: 4 },
  { word: "intend", definition: "to plan to do something (= 'pretender/intentar')", exampleSent: "I intend to finish the project by Friday.", translation: "intentar/pretender", category: "False Friends", difficulty: 3 },
  { word: "attend", definition: "to be present at an event (NOT 'atender')", exampleSent: "Will you attend the meeting tomorrow?", translation: "asistir (no 'atender')", category: "False Friends", difficulty: 3 },
  { word: "assist", definition: "to help someone", exampleSent: "Can I assist you with anything?", translation: "ayudar (no 'asistir')", category: "False Friends", difficulty: 3 },
  { word: "embarrassed", definition: "feeling ashamed (NOT 'embarazada')", exampleSent: "I was embarrassed by my mistake.", translation: "avergonzado (no 'embarazada')", category: "False Friends", difficulty: 4 },
  { word: "pregnant", definition: "expecting a baby (= 'embarazada')", exampleSent: "She is six months pregnant.", translation: "embarazada", category: "False Friends", difficulty: 2 },
  { word: "achieve", definition: "to successfully complete something", exampleSent: "She achieved the highest score in the class.", translation: "lograr", category: "Word Formation", difficulty: 2 },
  { word: "achievement", definition: "something accomplished successfully", exampleSent: "Winning the prize was a great achievement.", translation: "logro", category: "Word Formation", difficulty: 2 },
  { word: "compete", definition: "to try to win against others", exampleSent: "Five teams will compete in the final.", translation: "competir", category: "Word Formation", difficulty: 2 },
  { word: "competition", definition: "an event where people try to win", exampleSent: "She entered a photography competition.", translation: "competición", category: "Word Formation", difficulty: 2 },
  { word: "competitive", definition: "having a strong desire to win", exampleSent: "He's very competitive by nature.", translation: "competitivo", category: "Word Formation", difficulty: 3 },
  { word: "competitor", definition: "a person who takes part in a competition", exampleSent: "Our main competitor has lowered their prices.", translation: "competidor", category: "Word Formation", difficulty: 3 },
  { word: "rely", definition: "to depend on or trust someone/something", exampleSent: "You can rely on me to help.", translation: "depender de", category: "Word Formation", difficulty: 3 },
  { word: "reliable", definition: "able to be trusted or depended on", exampleSent: "He's the most reliable person I know.", translation: "fiable", category: "Word Formation", difficulty: 3 },
  { word: "unreliable", definition: "not able to be trusted", exampleSent: "The bus service is unreliable in winter.", translation: "poco fiable", category: "Word Formation", difficulty: 3 },
  { word: "reliability", definition: "the quality of being dependable", exampleSent: "The reliability of the system has improved.", translation: "fiabilidad", category: "Word Formation", difficulty: 4 },
];

export async function seedVocabularyForUser(userId: string) {
  console.log(`Seeding ${FCE_VOCABULARY.length} vocabulary items for user ${userId}`);

  const data = FCE_VOCABULARY.map((v) => ({
    userId,
    word: v.word,
    definition: v.definition,
    exampleSent: v.exampleSent,
    translation: v.translation,
    category: v.category,
    difficulty: v.difficulty,
  }));

  await db.vocabularyItem.createMany({
    data,
    skipDuplicates: true,
  });

  // Create initial streak
  await db.streak.upsert({
    where: { userId },
    update: {},
    create: { userId, currentDays: 0, longestDays: 0, totalDays: 0 },
  });

  console.log(`Seeded vocabulary for user ${userId}`);
}
