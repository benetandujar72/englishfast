export type ReadingLevel = "A1" | "A2" | "B1";

export interface ReadingFragment {
  id: string;
  level: ReadingLevel;
  topic: string;
  textEn: string;
  textEs: string;
}

export const READING_FRAGMENTS: ReadingFragment[] = [
  {
    id: "a1-routine-1",
    level: "A1",
    topic: "Daily routine",
    textEn:
      "I wake up at seven in the morning. I drink water and open the window. Then I have breakfast with my family.",
    textEs:
      "Me despierto a las siete de la manana. Bebo agua y abro la ventana. Luego desayuno con mi familia.",
  },
  {
    id: "a1-city-1",
    level: "A1",
    topic: "City life",
    textEn:
      "My city is small and friendly. There is a park near my house. On weekends I walk there and listen to music.",
    textEs:
      "Mi ciudad es pequena y amigable. Hay un parque cerca de mi casa. Los fines de semana camino alli y escucho musica.",
  },
  {
    id: "a1-shopping-1",
    level: "A1",
    topic: "Shopping",
    textEn:
      "Today I need bread, milk, and fruit. I go to the local market after work. The shop assistant is always kind to me.",
    textEs:
      "Hoy necesito pan, leche y fruta. Voy al mercado local despues del trabajo. El dependiente siempre es amable conmigo.",
  },
  {
    id: "a2-work-1",
    level: "A2",
    topic: "Work",
    textEn:
      "At work I answer emails and join short meetings. I try to speak English with my team every day. It helps me feel more confident.",
    textEs:
      "En el trabajo respondo correos y participo en reuniones cortas. Intento hablar ingles con mi equipo cada dia. Eso me ayuda a sentirme mas seguro.",
  },
  {
    id: "a2-health-1",
    level: "A2",
    topic: "Health",
    textEn:
      "I started running three times a week last month. At first it was difficult, but now I enjoy it. Exercise gives me more energy during the day.",
    textEs:
      "Empece a correr tres veces por semana el mes pasado. Al principio fue dificil, pero ahora lo disfruto. El ejercicio me da mas energia durante el dia.",
  },
  {
    id: "a2-travel-1",
    level: "A2",
    topic: "Travel",
    textEn:
      "Last summer I visited a coastal town with my friends. We explored the old center, tasted local food, and watched the sunset from the beach.",
    textEs:
      "El verano pasado visite un pueblo costero con mis amigos. Exploramos el casco antiguo, probamos comida local y vimos el atardecer desde la playa.",
  },
  {
    id: "b1-learning-1",
    level: "B1",
    topic: "Learning strategy",
    textEn:
      "When I study a language, I combine short daily sessions with weekly reviews. This method helps me remember vocabulary and notice my progress over time.",
    textEs:
      "Cuando estudio un idioma, combino sesiones cortas diarias con repasos semanales. Este metodo me ayuda a recordar vocabulario y a notar mi progreso con el tiempo.",
  },
  {
    id: "b1-technology-1",
    level: "B1",
    topic: "Technology",
    textEn:
      "Technology has changed the way we communicate and learn. Online platforms allow people to connect across cultures, but we still need strong critical thinking skills.",
    textEs:
      "La tecnologia ha cambiado la forma en que nos comunicamos y aprendemos. Las plataformas en linea permiten conectar culturas, pero aun necesitamos pensamiento critico solido.",
  },
  {
    id: "b1-environment-1",
    level: "B1",
    topic: "Environment",
    textEn:
      "Many neighborhoods are creating community gardens to improve local sustainability. These projects reduce waste, support healthy habits, and strengthen social relationships.",
    textEs:
      "Muchos barrios estan creando huertos comunitarios para mejorar la sostenibilidad local. Estos proyectos reducen residuos, fomentan habitos saludables y fortalecen las relaciones sociales.",
  },
];

export function pickRandomReadingFragment(level: ReadingLevel): ReadingFragment {
  const filtered = READING_FRAGMENTS.filter((f) => f.level === level);
  const source = filtered.length > 0 ? filtered : READING_FRAGMENTS;
  return source[Math.floor(Math.random() * source.length)];
}
