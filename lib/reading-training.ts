export type ReadingLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type ReadingLength = "short" | "medium" | "long";
export type CompetencyFocus =
  | "comprension"
  | "interaccion"
  | "produccion"
  | "escritura";
export type TopicFilter =
  | "general"
  | "personal"
  | "compras"
  | "trabajo"
  | "viajes"
  | "salud"
  | "tecnologia"
  | "sociedad"
  | "academico"
  | "profesional"
  | "cultura";

export interface ReadingFragment {
  id: string;
  level: ReadingLevel;
  duration: ReadingLength;
  topic: string;
  textEn: string;
  textEs: string;
  topicTags?: TopicFilter[];
  competencyTags?: CompetencyFocus[];
}

export const TOPIC_FILTER_OPTIONS: Array<{ value: TopicFilter; label: string }> = [
  { value: "general", label: "General" },
  { value: "personal", label: "Personal" },
  { value: "compras", label: "Compras" },
  { value: "trabajo", label: "Trabajo" },
  { value: "viajes", label: "Viajes" },
  { value: "salud", label: "Salud" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "sociedad", label: "Sociedad" },
  { value: "academico", label: "Academico" },
  { value: "profesional", label: "Profesional" },
  { value: "cultura", label: "Cultura" },
];

export const COMPETENCY_FILTER_OPTIONS: Array<{
  value: CompetencyFocus;
  label: string;
}> = [
  { value: "comprension", label: "Comprension oral + lectura" },
  { value: "interaccion", label: "Hablar: interaccion" },
  { value: "produccion", label: "Hablar: produccion" },
  { value: "escritura", label: "Escribir" },
];

export const CEFR_COMPETENCIES: Record<
  Exclude<ReadingLevel, "A1">,
  {
    comprension: string;
    interaccion: string;
    produccion: string;
    escritura: string;
  }
> = {
  A2: {
    comprension:
      "Comprendes frases frecuentes sobre temas cercanos y lees textos breves localizando informacion predecible.",
    interaccion:
      "Te comunicas en tareas rutinarias con intercambio directo de informacion, aunque en intercambios breves.",
    produccion:
      "Describes con terminos sencillos familia, condiciones de vida, formacion y trabajo.",
    escritura:
      "Escribes notas y mensajes breves sobre necesidades inmediatas y cartas personales muy sencillas.",
  },
  B1: {
    comprension:
      "Captas ideas principales de discursos claros y comprendes textos de uso habitual, incluidos de trabajo.",
    interaccion:
      "Te desenvuelves en situaciones de viaje y participas espontaneamente en conversaciones cotidianas.",
    produccion:
      "Enlazas frases para narrar experiencias, planes e historias y justificas brevemente opiniones.",
    escritura:
      "Redactas textos sencillos y cohesionados sobre temas conocidos y cartas de experiencias.",
  },
  B2: {
    comprension:
      "Entiendes discursos extensos sobre temas conocidos y lees articulos e informes con puntos de vista.",
    interaccion:
      "Interactuas con fluidez y espontaneidad para conversar con nativos y defender posturas.",
    produccion:
      "Produces descripciones claras y detalladas y explicas ventajas e inconvenientes de opciones.",
    escritura:
      "Escribes textos claros y detallados aportando razones a favor o en contra.",
  },
  C1: {
    comprension:
      "Comprendes discursos extensos y textos largos complejos apreciando matices de estilo.",
    interaccion:
      "Te expresas con fluidez y flexibilidad para fines sociales y profesionales.",
    produccion:
      "Presentas descripciones detalladas de temas complejos y cierras con conclusiones adecuadas.",
    escritura:
      "Redactas textos claros, bien estructurados y ajustados al destinatario destacando lo importante.",
  },
  C2: {
    comprension:
      "Entiendes practicamente cualquier lengua hablada y lees con facilidad textos complejos y abstractos.",
    interaccion:
      "Participas sin esfuerzo en conversaciones y debates, con matices finos y precision.",
    produccion:
      "Expones argumentos y descripciones de forma clara, fluida y con estructura logica eficaz.",
    escritura:
      "Escribes textos complejos con estructura logica y elaboras resumenes y resenas profesionales.",
  },
};

export const READING_FRAGMENTS: ReadingFragment[] = [
  {
    id: "a1-routine-1",
    level: "A1",
    duration: "long",
    topic: "Short story: Morning routine",
    textEn:
      "Every weekday I wake up at seven o'clock. First, I drink a glass of water and open the window to get fresh air. Then I go to the kitchen and prepare a simple breakfast. I usually eat bread, fruit, and yogurt. My sister likes coffee, but I prefer tea with milk. After breakfast, we clean the table together. I brush my teeth, put my books in my bag, and check my phone for the bus time. Before I leave home, I say goodbye to my parents and feed our small cat. It is a quiet routine, but it helps me start the day with energy.",
    textEs:
      "Cada dia de semana me despierto a las siete en punto. Primero, bebo un vaso de agua y abro la ventana para tener aire fresco. Luego voy a la cocina y preparo un desayuno sencillo. Normalmente como pan, fruta y yogur. A mi hermana le gusta el cafe, pero yo prefiero te con leche. Despues del desayuno, limpiamos la mesa juntos. Me lavo los dientes, pongo mis libros en la mochila y miro el movil para ver la hora del autobus. Antes de salir de casa, me despido de mis padres y doy de comer a nuestro gato pequeno. Es una rutina tranquila, pero me ayuda a empezar el dia con energia.",
  },
  {
    id: "a1-city-1",
    level: "A1",
    duration: "long",
    topic: "Short story: My neighborhood",
    textEn:
      "I live in a small neighborhood near the city center. In the morning, the streets are calm and clean. There is a bakery on the corner, and the smell of fresh bread is everywhere. Next to the bakery, there is a flower shop with red and yellow roses. In the afternoon, many children play in the square. Older people sit on the benches and talk about daily life. On Saturdays, a local market opens in front of the library. You can buy vegetables, cheese, and handmade soap. I like this place because people know each other and always say hello. It feels safe, friendly, and full of simple moments.",
    textEs:
      "Vivo en un barrio pequeno cerca del centro de la ciudad. Por la manana, las calles son tranquilas y limpias. Hay una panaderia en la esquina, y el olor a pan recien hecho esta por todas partes. Al lado de la panaderia, hay una floristeria con rosas rojas y amarillas. Por la tarde, muchos ninos juegan en la plaza. Las personas mayores se sientan en los bancos y hablan de la vida diaria. Los sabados, un mercado local abre delante de la biblioteca. Puedes comprar verduras, queso y jabon artesanal. Me gusta este lugar porque la gente se conoce y siempre saluda. Se siente seguro, amable y lleno de momentos sencillos.",
  },
  {
    id: "a1-shopping-1",
    level: "A1",
    duration: "long",
    topic: "Short story: At the market",
    textEn:
      "On Friday afternoon, I go to the local market with a short shopping list. I need bread, milk, apples, rice, and eggs for the weekend. The market is busy, but the atmosphere is warm and cheerful. First, I visit the fruit stand and choose red apples and bananas. Then I walk to the dairy section and buy fresh milk and yogurt. I also stop at a small stall that sells homemade jam. The seller lets me taste orange jam, and it is delicious. Before I go home, I check my list again to be sure I have everything. I carry two bags, but I feel happy because my kitchen is ready for the week.",
    textEs:
      "El viernes por la tarde voy al mercado local con una lista corta de compras. Necesito pan, leche, manzanas, arroz y huevos para el fin de semana. El mercado esta lleno, pero el ambiente es calido y alegre. Primero, visito el puesto de fruta y elijo manzanas rojas y platanos. Luego camino a la seccion de lacteos y compro leche fresca y yogur. Tambien paso por un puesto pequeno que vende mermelada casera. La vendedora me deja probar mermelada de naranja, y esta deliciosa. Antes de volver a casa, reviso mi lista otra vez para asegurarme de que tengo todo. Llevo dos bolsas, pero me siento contento porque mi cocina esta lista para la semana.",
  },
  {
    id: "a2-work-1",
    level: "A2",
    duration: "long",
    topic: "Short story: First week at a new job",
    textEn:
      "This month I started a new job in a small design company. During my first week, everything was new, from the software to the team routines. Every morning we have a short meeting to plan priorities. I usually take notes and ask two or three questions to avoid mistakes later. My manager encourages me to speak in English during meetings, even when I feel nervous. At lunch time, I sit with two colleagues who are patient and friendly. They correct my pronunciation in a respectful way and teach me useful expressions. At the end of the day, I review my tasks and prepare a simple to-do list for tomorrow. The routine is demanding, but I can already see my confidence growing.",
    textEs:
      "Este mes empece un nuevo trabajo en una pequena empresa de diseno. Durante mi primera semana, todo era nuevo, desde el software hasta las rutinas del equipo. Cada manana tenemos una reunion corta para planificar prioridades. Normalmente tomo notas y hago dos o tres preguntas para evitar errores despues. Mi responsable me anima a hablar en ingles durante las reuniones, incluso cuando me pongo nervioso. A la hora de comer, me siento con dos companeros pacientes y amables. Corrigen mi pronunciacion con respeto y me ensenan expresiones utiles. Al final del dia, reviso mis tareas y preparo una lista sencilla para manana. La rutina es exigente, pero ya puedo ver que mi confianza crece.",
  },
  {
    id: "a2-health-1",
    level: "A2",
    duration: "long",
    topic: "Short story: Building healthy habits",
    textEn:
      "At the beginning of the year, I decided to improve my health with small daily habits. I started by walking twenty minutes after dinner, three days per week. After two weeks, I felt better and added short morning stretches at home. I also changed my breakfast and included fruit, oats, and more water. On weekends, I cook simple meals for the next few days to avoid fast food. Sometimes I still feel tired, especially after long workdays, but I try to stay consistent. My friend joined me, and now we motivate each other. We share progress messages and celebrate small wins. These changes are not dramatic, but they make my body stronger and my mind calmer.",
    textEs:
      "Al principio del ano, decidi mejorar mi salud con pequenos habitos diarios. Empece caminando veinte minutos despues de cenar, tres dias por semana. Tras dos semanas, me senti mejor y anadi estiramientos cortos por la manana en casa. Tambien cambie mi desayuno e inclui fruta, avena y mas agua. Los fines de semana cocino comidas sencillas para varios dias y asi evito comida rapida. A veces sigo cansado, sobre todo despues de dias largos de trabajo, pero intento mantener la constancia. Un amigo se unio a mi, y ahora nos motivamos mutuamente. Compartimos mensajes de progreso y celebramos pequenas victorias. Estos cambios no son dramaticos, pero hacen mi cuerpo mas fuerte y mi mente mas tranquila.",
  },
  {
    id: "a2-travel-1",
    level: "A2",
    duration: "long",
    topic: "Short story: Weekend trip by train",
    textEn:
      "Last spring, I took a weekend train trip with two friends to a town near the sea. We left early on Saturday with backpacks, snacks, and a printed map. When we arrived, the station was small but full of light. First, we walked through the old streets and took photos of colorful buildings. Later, we found a restaurant run by a local family and tried fresh fish with lemon rice. In the afternoon, we visited a small museum about local history and traditions. Before sunset, we sat on the beach and listened to the waves. On Sunday morning, we bought postcards and coffee before returning home. It was a short trip, but it gave us new energy for the week.",
    textEs:
      "La primavera pasada hice un viaje de fin de semana en tren con dos amigos a un pueblo cerca del mar. Salimos temprano el sabado con mochilas, comida y un mapa impreso. Cuando llegamos, la estacion era pequena pero muy luminosa. Primero caminamos por las calles antiguas y tomamos fotos de edificios de colores. Despues encontramos un restaurante de una familia local y probamos pescado fresco con arroz al limon. Por la tarde visitamos un pequeno museo sobre historia y tradiciones del lugar. Antes del atardecer, nos sentamos en la playa y escuchamos las olas. El domingo por la manana compramos postales y cafe antes de volver a casa. Fue un viaje corto, pero nos dio nueva energia para la semana.",
  },
  {
    id: "b1-learning-1",
    level: "B1",
    duration: "long",
    topic: "Short story: A method that finally worked",
    textEn:
      "For years, I tried to improve my English with long study sessions on weekends, but I always forgot what I learned. Three months ago, I changed my strategy completely. Instead of studying for three hours once a week, I now practice twenty-five minutes every day and review my notes on Sundays. During weekdays, I focus on one skill at a time: listening on Monday, speaking on Tuesday, reading on Wednesday, and writing on Thursday. Friday is my mixed practice day, when I use everything together in short tasks. I also record myself reading short texts and compare my pronunciation every two weeks. This routine is easier to maintain, and my progress is clearer. I still make mistakes, but now I can identify patterns and correct them faster.",
    textEs:
      "Durante anos intente mejorar mi ingles con sesiones largas los fines de semana, pero siempre olvidaba lo aprendido. Hace tres meses cambie mi estrategia por completo. En lugar de estudiar tres horas una vez por semana, ahora practico veinticinco minutos cada dia y reviso mis apuntes los domingos. Entre semana me concentro en una habilidad cada dia: listening el lunes, speaking el martes, reading el miercoles y writing el jueves. El viernes hago practica mixta para combinar todo en tareas cortas. Tambien me grabo leyendo textos breves y comparo mi pronunciacion cada dos semanas. Esta rutina es mas facil de mantener y mi progreso es mas visible. Sigo cometiendo errores, pero ahora detecto patrones y los corrijo mas rapido.",
  },
  {
    id: "b1-technology-1",
    level: "B1",
    duration: "long",
    topic: "Short story: Learning with digital tools",
    textEn:
      "My brother and I are both learning languages, but we use technology in different ways. He prefers video lessons and interactive games, while I like podcasts, digital flashcards, and online conversation clubs. At first, I thought his method was too casual, but I noticed he was building confidence quickly. He practiced daily without feeling tired, because his activities were short and varied. I learned from that and redesigned my routine. Now I combine a reading app, a pronunciation tool, and one weekly conversation session with native speakers. However, technology is not enough by itself. We still need discipline, reflection, and clear goals. The best results come when digital tools support a smart plan instead of replacing it.",
    textEs:
      "Mi hermano y yo estamos aprendiendo idiomas, pero usamos la tecnologia de forma diferente. El prefiere videos y juegos interactivos, mientras yo prefiero podcasts, tarjetas digitales y clubes de conversacion en linea. Al principio pense que su metodo era demasiado informal, pero note que ganaba confianza muy rapido. Practicaba cada dia sin cansarse porque sus actividades eran cortas y variadas. Aprendi de eso y rediseñe mi rutina. Ahora combino una app de lectura, una herramienta de pronunciacion y una sesion semanal de conversacion con hablantes nativos. Sin embargo, la tecnologia por si sola no basta. Seguimos necesitando disciplina, reflexion y objetivos claros. Los mejores resultados llegan cuando las herramientas digitales apoyan un plan inteligente, no cuando lo sustituyen.",
  },
  {
    id: "b1-environment-1",
    level: "B1",
    duration: "long",
    topic: "Short story: The community garden project",
    textEn:
      "Two years ago, an empty lot near our building was full of trash and broken furniture. A local teacher suggested creating a community garden, and little by little the idea became real. First, volunteers cleaned the area and built small wooden boxes for planting. Later, families brought seeds, tools, and old containers for recycling water. Children painted signs with plant names in two languages, and older neighbors shared practical tips about seasons and soil. Today the garden produces tomatoes, herbs, and lettuce for many homes in the street. More importantly, it changed the way people relate to each other. Neighbors who never spoke now cooperate every weekend. The project does not solve every environmental problem, but it proves that small local actions can create meaningful change.",
    textEs:
      "Hace dos anos, un solar vacio cerca de nuestro edificio estaba lleno de basura y muebles rotos. Una profesora local propuso crear un huerto comunitario y, poco a poco, la idea se hizo realidad. Primero, voluntarios limpiaron la zona y construyeron cajas de madera para plantar. Despues, las familias trajeron semillas, herramientas y recipientes usados para reciclar agua. Los ninos pintaron carteles con nombres de plantas en dos idiomas, y los vecinos mayores compartieron consejos practicos sobre estaciones y tierra. Hoy el huerto produce tomates, hierbas y lechuga para muchas casas de la calle. Lo mas importante es que cambio la forma en que las personas se relacionan. Vecinos que nunca hablaban ahora cooperan cada fin de semana. El proyecto no resuelve todos los problemas ambientales, pero demuestra que acciones locales pequenas pueden crear cambios significativos.",
  },
  {
    id: "a1-home-2",
    level: "A1",
    duration: "medium",
    topic: "Short story: Evening at home",
    textEn:
      "After work, Marta arrives home tired but calm. She takes off her shoes, opens the windows, and waters two small plants in the living room. Then she prepares a simple dinner with soup, rice, and a small salad. While she eats, she listens to soft music and writes three lines in her notebook about her day. Before sleeping, she reads a short story in English for ten minutes.",
    textEs:
      "Despues del trabajo, Marta llega a casa cansada pero tranquila. Se quita los zapatos, abre las ventanas y riega dos plantas pequenas del salon. Luego prepara una cena sencilla con sopa, arroz y una ensalada pequena. Mientras cena, escucha musica suave y escribe tres lineas en su cuaderno sobre su dia. Antes de dormir, lee un relato corto en ingles durante diez minutos.",
  },
  {
    id: "a1-school-2",
    level: "A1",
    duration: "medium",
    topic: "Short story: New classmate",
    textEn:
      "In class, we have a new student called Leo. On his first day, he sits near me and smiles. The teacher asks us to work in pairs and read a short dialogue. Leo reads slowly but clearly, and I help him with two difficult words. During the break, we talk about music and football. At the end of the lesson, he says, 'Thank you for your help.'",
    textEs:
      "En clase tenemos un estudiante nuevo llamado Leo. En su primer dia se sienta cerca de mi y sonrie. La profesora nos pide trabajar en parejas y leer un dialogo corto. Leo lee despacio pero con claridad, y yo le ayudo con dos palabras dificiles. En el descanso hablamos de musica y futbol. Al final de la clase, el dice: 'Gracias por tu ayuda'.",
  },
  {
    id: "a1-cafe-2",
    level: "A1",
    duration: "short",
    topic: "Mini story: At the cafe",
    textEn:
      "On Sunday morning, I go to a small cafe near the station. I order tea and a cheese sandwich. The waiter is friendly and asks about my day. I open my book and read for fifteen minutes. The cafe is quiet, and I feel relaxed.",
    textEs:
      "El domingo por la manana voy a una cafeteria pequena cerca de la estacion. Pido te y un sandwich de queso. El camarero es amable y pregunta por mi dia. Abro mi libro y leo quince minutos. La cafeteria esta tranquila y me siento relajado.",
  },
  {
    id: "a1-park-2",
    level: "A1",
    duration: "short",
    topic: "Mini story: Afternoon in the park",
    textEn:
      "In the afternoon, my cousin and I walk to the park. We sit on a bench and watch people ride bicycles. A child plays with a red ball near the fountain. The weather is warm, and the sky is clear. We stay there until sunset.",
    textEs:
      "Por la tarde, mi primo y yo caminamos al parque. Nos sentamos en un banco y vemos a la gente montar en bicicleta. Un nino juega con una pelota roja cerca de la fuente. El tiempo es calido y el cielo esta despejado. Nos quedamos alli hasta el atardecer.",
  },
  {
    id: "a1-family-2",
    level: "A1",
    duration: "medium",
    topic: "Short story: Family dinner",
    textEn:
      "Every Friday, my family has dinner together at my grandmother's house. My uncle cooks chicken and vegetables, and my aunt brings a homemade cake. We talk about work, school, and weekend plans. My little brother always tells funny stories, and everyone laughs. After dinner, we wash dishes together and take a short walk in the street.",
    textEs:
      "Cada viernes, mi familia cena junta en casa de mi abuela. Mi tio cocina pollo con verduras y mi tia trae un pastel casero. Hablamos del trabajo, de la escuela y de los planes del fin de semana. Mi hermano pequeno siempre cuenta historias graciosas y todos se rien. Despues de cenar, lavamos los platos juntos y damos un paseo corto por la calle.",
  },
  {
    id: "a1-library-2",
    level: "A1",
    duration: "medium",
    topic: "Short story: Visit to the library",
    textEn:
      "On Tuesday, I visit the public library after class. It is quiet and bright, with many books in English for beginners. I choose one about animals and another about daily life. The librarian helps me find an audio version so I can listen and read at the same time. I study there for one hour and take notes in a small notebook.",
    textEs:
      "El martes visito la biblioteca publica despues de clase. Es silenciosa y luminosa, con muchos libros de ingles para principiantes. Elijo uno sobre animales y otro sobre la vida diaria. La bibliotecaria me ayuda a encontrar una version de audio para escuchar y leer al mismo tiempo. Estudio alli durante una hora y tomo notas en un cuaderno pequeno.",
  },
  {
    id: "a1-bus-2",
    level: "A1",
    duration: "short",
    topic: "Mini story: On the bus",
    textEn:
      "This morning, the bus is full and everyone is quiet. I stand near the window and listen to an English podcast. Two stops later, an older man enters, and I offer him my seat. He thanks me with a smile. The city looks beautiful in the early light.",
    textEs:
      "Esta manana, el autobus va lleno y todos estan en silencio. Estoy de pie junto a la ventana y escucho un podcast en ingles. Dos paradas despues sube un senor mayor y le ofrezco mi asiento. Me da las gracias con una sonrisa. La ciudad se ve bonita con la luz de primera hora.",
  },
  {
    id: "a2-project-2",
    level: "A2",
    duration: "medium",
    topic: "Short story: Team project",
    textEn:
      "Our teacher asked us to prepare a short presentation about healthy habits. My team met twice after class to divide tasks and collect ideas. I was responsible for the opening and conclusion, so I practiced pronunciation at home every night. On presentation day, I felt nervous, but my classmates supported me. We finished on time and received positive comments.",
    textEs:
      "Nuestra profesora nos pidio preparar una presentacion corta sobre habitos saludables. Mi equipo se reunio dos veces despues de clase para repartir tareas y reunir ideas. Yo era responsable de la introduccion y la conclusion, asi que practique pronunciacion en casa cada noche. El dia de la presentacion estaba nervioso, pero mis companeros me apoyaron. Terminamos a tiempo y recibimos comentarios positivos.",
  },
  {
    id: "a2-neighbor-2",
    level: "A2",
    duration: "medium",
    topic: "Short story: Helping a neighbor",
    textEn:
      "Last week, my neighbor asked me for help with an online form in English. At first, she was worried because she did not understand some instructions. We sat at the kitchen table and completed each section step by step. I explained key words and wrote simple examples in Spanish. In the end, she submitted the form successfully and felt relieved.",
    textEs:
      "La semana pasada, mi vecina me pidio ayuda con un formulario online en ingles. Al principio estaba preocupada porque no entendia algunas instrucciones. Nos sentamos en la mesa de la cocina y completamos cada seccion paso a paso. Le explique palabras clave y escribi ejemplos sencillos en espanol. Al final, envio el formulario correctamente y se sintio aliviada.",
  },
  {
    id: "a2-weekend-2",
    level: "A2",
    duration: "short",
    topic: "Mini story: Busy weekend",
    textEn:
      "My weekend was busy but enjoyable. On Saturday, I cleaned my room and prepared meals for Monday and Tuesday. In the evening, I watched a film in English with subtitles. On Sunday, I met friends for lunch and practiced speaking for thirty minutes.",
    textEs:
      "Mi fin de semana fue ocupado pero agradable. El sabado limpie mi habitacion y prepare comidas para lunes y martes. Por la noche vi una pelicula en ingles con subtitulos. El domingo quede con amigos para comer y practique speaking durante treinta minutos.",
  },
  {
    id: "a2-interview-2",
    level: "A2",
    duration: "medium",
    topic: "Short story: Preparing an interview",
    textEn:
      "I have a job interview next Thursday, so I created a study plan for this week. Every day, I practice common questions and record my answers with my phone. Then I listen again and correct mistakes in grammar and pronunciation. I also read company information to prepare good questions for the interviewer. This routine helps me feel calm and prepared.",
    textEs:
      "Tengo una entrevista de trabajo el proximo jueves, asi que cree un plan de estudio para esta semana. Cada dia practico preguntas comunes y grabo mis respuestas con el movil. Luego las escucho de nuevo y corrijo errores de gramatica y pronunciacion. Tambien leo informacion de la empresa para preparar buenas preguntas para la entrevistadora. Esta rutina me ayuda a sentirme tranquilo y preparado.",
  },
  {
    id: "a2-museum-2",
    level: "A2",
    duration: "short",
    topic: "Mini story: Museum visit",
    textEn:
      "Yesterday I visited a science museum with my cousin. We saw a special exhibition about the human brain and learning habits. The explanations were simple, and there were interactive games to test memory. We spent two hours there and took many notes for school.",
    textEs:
      "Ayer visite un museo de ciencia con mi prima. Vimos una exposicion especial sobre el cerebro humano y los habitos de aprendizaje. Las explicaciones eran sencillas y habia juegos interactivos para probar la memoria. Estuvimos dos horas alli y tomamos muchas notas para clase.",
  },
  {
    id: "a2-readingclub-2",
    level: "A2",
    duration: "medium",
    topic: "Short story: Reading club",
    textEn:
      "I joined a local reading club to improve my English speaking confidence. Each meeting has ten people, and we discuss one short text together. First, we read silently for five minutes. Then we take turns reading paragraphs aloud and giving gentle feedback. This activity helps me improve pronunciation and intonation in a relaxed environment.",
    textEs:
      "Me uni a un club local de lectura para mejorar mi confianza al hablar ingles. Cada reunion tiene diez personas y comentamos un texto corto juntos. Primero leemos en silencio durante cinco minutos. Luego leemos parrafos en voz alta por turnos y damos feedback amable. Esta actividad me ayuda a mejorar pronunciacion y entonacion en un ambiente relajado.",
  },
  {
    id: "a2-foodblog-2",
    level: "A2",
    duration: "short",
    topic: "Mini story: Writing a food blog",
    textEn:
      "This month I started a small food blog in English. I write simple posts about recipes from my family and local restaurants. Before publishing, I check verbs and connectors carefully. My friends read the posts and send corrections. Little by little, my writing sounds more natural.",
    textEs:
      "Este mes empece un pequeno blog de comida en ingles. Escribo publicaciones sencillas sobre recetas de mi familia y restaurantes locales. Antes de publicar, reviso verbos y conectores con cuidado. Mis amigos leen las entradas y me envian correcciones. Poco a poco, mi escritura suena mas natural.",
  },
  {
    id: "b1-volunteer-2",
    level: "B1",
    duration: "long",
    topic: "Short story: Volunteering on weekends",
    textEn:
      "Last autumn, I joined a volunteer group that supports newly arrived families in my city. Every Saturday morning, we organize language activities for adults and children. My role is to guide short reading sessions and conversation practice. At first, I was worried because people had very different levels, but we learned to adapt tasks in flexible ways. Sometimes we use pictures, sometimes role-play, and sometimes short stories based on real-life situations. The most rewarding moment is when someone who was silent in the first session starts speaking confidently after a few weeks. Volunteering has improved my communication skills and my patience. It has also reminded me that language learning is deeply connected to dignity and inclusion.",
    textEs:
      "El otono pasado me uni a un grupo de voluntariado que apoya a familias recien llegadas en mi ciudad. Cada sabado por la manana organizamos actividades de idioma para adultos y ninos. Mi papel es guiar sesiones cortas de lectura y practica de conversacion. Al principio estaba preocupado porque las personas tenian niveles muy diferentes, pero aprendimos a adaptar las tareas de forma flexible. A veces usamos imagenes, a veces role-play y a veces relatos cortos basados en situaciones reales. El momento mas gratificante es cuando alguien que estaba en silencio en la primera sesion empieza a hablar con confianza despues de unas semanas. El voluntariado ha mejorado mis habilidades de comunicacion y mi paciencia. Tambien me ha recordado que aprender idiomas esta muy relacionado con la dignidad y la inclusion.",
  },
  {
    id: "b1-decision-2",
    level: "B1",
    duration: "medium",
    topic: "Short story: A difficult decision",
    textEn:
      "Two months ago, I had to decide between two opportunities: a stable local job and an internship abroad with uncertain conditions. The local job offered security, but the internship promised faster growth and international experience. I made a list of pros and cons and discussed it with my family and mentor. In the end, I chose the internship because I wanted to challenge myself. The first weeks were intense, but I learned more than I expected.",
    textEs:
      "Hace dos meses tuve que decidir entre dos oportunidades: un trabajo local estable y unas practicas en el extranjero con condiciones inciertas. El trabajo local ofrecia seguridad, pero las practicas prometian crecimiento mas rapido y experiencia internacional. Hice una lista de ventajas y desventajas y lo hable con mi familia y con mi mentor. Al final elegi las practicas porque queria desafiarme. Las primeras semanas fueron intensas, pero aprendi mas de lo que esperaba.",
  },
  {
    id: "b1-podcast-2",
    level: "B1",
    duration: "medium",
    topic: "Short story: Starting a podcast",
    textEn:
      "My friend and I started a small podcast about language learning strategies for busy people. We publish one episode every two weeks and invite students to share practical routines. Preparing each episode takes more work than we imagined, because we research sources, draft scripts, and edit audio carefully. Still, the project has helped us speak more clearly and structure ideas better.",
    textEs:
      "Mi amigo y yo empezamos un pequeno podcast sobre estrategias de aprendizaje de idiomas para personas ocupadas. Publicamos un episodio cada dos semanas e invitamos a estudiantes a compartir rutinas practicas. Preparar cada episodio lleva mas trabajo del que imaginabamos, porque investigamos fuentes, redactamos guiones y editamos audio con cuidado. Aun asi, el proyecto nos ha ayudado a hablar con mas claridad y a estructurar mejor las ideas.",
  },
  {
    id: "b1-traindelay-2",
    level: "B1",
    duration: "short",
    topic: "Mini story: Unexpected delay",
    textEn:
      "During a business trip, my train was delayed for almost two hours. Instead of getting frustrated, I used the time to review notes for my presentation and practice key sentences aloud. When I finally arrived, I felt surprisingly prepared and delivered a clear talk. The delay became an advantage.",
    textEs:
      "Durante un viaje de trabajo, mi tren se retraso casi dos horas. En lugar de frustrarme, use ese tiempo para repasar notas de mi presentacion y practicar en voz alta frases clave. Cuando por fin llegue, me senti sorprendentemente preparado y di una charla clara. El retraso se convirtio en una ventaja.",
  },
  {
    id: "b1-readinggroup-2",
    level: "B1",
    duration: "medium",
    topic: "Short story: Community reading group",
    textEn:
      "Our community center launched a bilingual reading group for young adults. Each session includes one short text in English and one discussion activity in the participants' native language. The idea is to reduce anxiety and improve comprehension at the same time. After six sessions, most members reported better pronunciation and stronger motivation.",
    textEs:
      "Nuestro centro comunitario lanzo un grupo de lectura bilingue para adultos jovenes. Cada sesion incluye un texto corto en ingles y una actividad de debate en la lengua materna de los participantes. La idea es reducir la ansiedad y mejorar la comprension al mismo tiempo. Tras seis sesiones, la mayoria de miembros dijo tener mejor pronunciacion y mayor motivacion.",
  },
  {
    id: "b1-mentoring-2",
    level: "B1",
    duration: "long",
    topic: "Short story: Language mentoring",
    textEn:
      "At my university, I joined a mentoring program where advanced students support beginners in language courses. My mentee, Carla, was afraid of speaking in public and often avoided participating in class. We designed a simple weekly plan: ten minutes of reading aloud, five minutes of conversation, and a short reflection at the end. At first, progress was slow, but consistency made a difference. After one month, Carla volunteered to read a paragraph in class, and her pronunciation was much clearer. By the end of the semester, she was asking questions and sharing opinions confidently. This experience taught me that effective learning is not only about content quality. It also depends on emotional safety, clear routines, and meaningful feedback.",
    textEs:
      "En mi universidad me uni a un programa de mentoria donde estudiantes avanzados apoyan a principiantes en cursos de idiomas. Mi estudiante, Carla, tenia miedo de hablar en publico y a menudo evitaba participar en clase. Disenamos un plan semanal sencillo: diez minutos de lectura en voz alta, cinco minutos de conversacion y una reflexion breve al final. Al principio el progreso fue lento, pero la constancia marco la diferencia. Tras un mes, Carla se ofrecio voluntaria para leer un parrafo en clase y su pronunciacion era mucho mas clara. Al final del semestre ya hacia preguntas y compartia opiniones con seguridad. Esta experiencia me enseno que el aprendizaje eficaz no depende solo de la calidad del contenido. Tambien depende de la seguridad emocional, de rutinas claras y de feedback significativo.",
  },
  {
    id: "b1-habitloop-2",
    level: "B1",
    duration: "short",
    topic: "Mini story: Habit loop",
    textEn:
      "I used to skip English practice when I felt tired after work. Now I connect practice to a fixed routine: I make tea, set a fifteen-minute timer, and read one page aloud. This small habit loop reduces excuses and keeps my progress stable.",
    textEs:
      "Antes solia saltarme la practica de ingles cuando estaba cansado despues del trabajo. Ahora conecto la practica a una rutina fija: preparo te, pongo un temporizador de quince minutos y leo una pagina en voz alta. Este pequeno bucle de habito reduce excusas y mantiene estable mi progreso.",
  },
  {
    id: "b1-workshop-2",
    level: "B1",
    duration: "medium",
    topic: "Short story: Communication workshop",
    textEn:
      "My company organized a communication workshop to improve collaboration between international teams. We practiced active listening, concise speaking, and constructive feedback. In one exercise, each person had to explain a complex idea in under two minutes. That challenge helped me simplify language and prioritize key points.",
    textEs:
      "Mi empresa organizo un taller de comunicacion para mejorar la colaboracion entre equipos internacionales. Practicamos escucha activa, expresion concisa y feedback constructivo. En un ejercicio, cada persona tenia que explicar una idea compleja en menos de dos minutos. Ese reto me ayudo a simplificar el lenguaje y priorizar ideas clave.",
  },
  {
    id: "b1-cityplan-2",
    level: "B1",
    duration: "medium",
    topic: "Short story: A better city plan",
    textEn:
      "During a local planning meeting, residents discussed how to make the neighborhood safer and greener. Some proposed wider sidewalks and more bike lanes, while others suggested better lighting and public gardens. After a long discussion, the group agreed on a practical pilot plan. Small improvements started within two months, and public satisfaction increased.",
    textEs:
      "Durante una reunion local de planificacion, los vecinos debatieron como hacer el barrio mas seguro y sostenible. Algunos propusieron aceras mas amplias y mas carriles bici, mientras otros sugirieron mejor iluminacion y jardines publicos. Tras un debate largo, el grupo acordo un plan piloto practico. Las mejoras pequenas empezaron en dos meses y la satisfaccion ciudadana aumento.",
  },
  {
    id: "b1-reflection-2",
    level: "B1",
    duration: "long",
    topic: "Short story: Looking back after one year",
    textEn:
      "One year ago, I set a goal to reach B1 speaking confidence for work and travel. At the beginning, I struggled with pronunciation, and I often translated word by word in my head. Instead of giving up, I built a realistic system: daily micro-practice, weekly review, and monthly self-recordings. I tracked my mistakes and grouped them into patterns, especially verb tenses and sentence rhythm. Over time, I noticed that my biggest improvement came from reading aloud and receiving clear feedback, not from memorizing long vocabulary lists. Now I can hold conversations with less stress and express opinions with more structure. I still have a lot to learn, but my process is sustainable and evidence-based. The most valuable lesson is simple: consistency beats intensity when learning a language.",
    textEs:
      "Hace un ano me marque el objetivo de alcanzar confianza oral de nivel B1 para trabajo y viajes. Al principio me costaba la pronunciacion y solia traducir palabra por palabra en mi cabeza. En lugar de abandonar, construi un sistema realista: micro-practica diaria, repaso semanal y auto-grabaciones mensuales. Registre mis errores y los agrupe por patrones, sobre todo tiempos verbales y ritmo de frase. Con el tiempo note que mi mayor mejora vino de leer en voz alta y recibir feedback claro, no de memorizar listas largas de vocabulario. Ahora puedo mantener conversaciones con menos estres y expresar opiniones con mas estructura. Aun me queda mucho por aprender, pero mi proceso es sostenible y basado en evidencia. La leccion mas valiosa es simple: la constancia supera a la intensidad al aprender un idioma.",
  },
  {
    id: "b2-policy-1",
    level: "B2",
    duration: "medium",
    topic: "Article: Remote work policy debate",
    textEn:
      "Many companies are redesigning their remote work policies after noticing both gains and losses in productivity. Supporters of hybrid models argue that flexibility improves wellbeing and reduces commuting stress, which can increase focus on complex tasks. Critics, however, point out that collaboration and onboarding become harder when teams rarely meet in person. In one recent internal survey, managers reported better individual output but weaker cross-team alignment. A possible compromise is to schedule fixed in-office collaboration days while preserving flexible deep-work days at home. This approach requires clear communication standards and measurable goals.",
    textEs:
      "Muchas empresas estan redisenando sus politicas de trabajo remoto tras observar ganancias y perdidas de productividad. Quienes apoyan modelos hibridos sostienen que la flexibilidad mejora el bienestar y reduce el estres de desplazamiento, lo que puede aumentar la concentracion en tareas complejas. Sin embargo, las criticas indican que la colaboracion y la incorporacion de nuevos empleados se vuelven mas dificiles cuando los equipos casi no coinciden en persona. En una encuesta interna reciente, los responsables reportaron mejor rendimiento individual pero peor alineacion entre equipos. Un posible compromiso es fijar dias de colaboracion presencial y mantener dias flexibles para trabajo profundo en casa. Este enfoque exige estandares de comunicacion claros y objetivos medibles.",
    topicTags: ["trabajo", "profesional"],
    competencyTags: ["comprension", "interaccion", "produccion", "escritura"],
  },
  {
    id: "b2-education-1",
    level: "B2",
    duration: "long",
    topic: "Report: Digital education and equity",
    textEn:
      "Digital education expanded rapidly in recent years, but access quality remains uneven across regions and income groups. While devices are now more available, reliable connectivity and quiet study spaces are still major barriers for many learners. Educators also report that students with weaker self-regulation skills struggle more in asynchronous environments. On the positive side, data-informed tutoring systems can personalize content and offer timely feedback when used responsibly. The main challenge is not choosing between traditional and digital methods, but designing blended models that preserve human guidance while leveraging adaptive technologies. Policymakers therefore need to combine infrastructure investment, teacher training, and evidence-based evaluation frameworks.",
    textEs:
      "La educacion digital se expandio rapidamente en los ultimos anos, pero la calidad de acceso sigue siendo desigual entre regiones y grupos de ingresos. Aunque los dispositivos son ahora mas comunes, la conectividad fiable y los espacios tranquilos de estudio siguen siendo barreras importantes para muchos estudiantes. Los docentes tambien informan de que el alumnado con menor autorregulacion tiene mas dificultades en entornos asincronos. En el lado positivo, los sistemas de tutoria basados en datos pueden personalizar contenidos y ofrecer feedback oportuno si se usan con responsabilidad. El reto principal no es elegir entre metodos tradicionales y digitales, sino disenar modelos mixtos que mantengan la guia humana y aprovechen tecnologias adaptativas. Por ello, las politicas publicas deben combinar inversion en infraestructuras, formacion docente y marcos de evaluacion basados en evidencia.",
    topicTags: ["academico", "sociedad", "tecnologia"],
    competencyTags: ["comprension", "produccion", "escritura"],
  },
  {
    id: "c1-research-1",
    level: "C1",
    duration: "long",
    topic: "Essay: Interpreting research responsibly",
    textEn:
      "Public discussions increasingly rely on scientific claims, yet many participants interpret findings without considering methodological limits. A statistically significant result, for instance, does not automatically imply practical relevance in real-world settings. Likewise, causal language is often used in contexts where studies only establish correlation. Responsible interpretation requires attention to sample size, selection bias, and reproducibility, as well as transparent reporting of uncertainty. Journalists, educators, and policy advisors therefore share a responsibility: they must communicate evidence with precision while preserving accessibility for non-specialist audiences. If this balance is not achieved, decision-makers may adopt simplistic narratives that ignore complexity and produce ineffective interventions.",
    textEs:
      "Los debates publicos dependen cada vez mas de afirmaciones cientificas, pero muchas personas interpretan hallazgos sin considerar limites metodologicos. Un resultado estadisticamente significativo, por ejemplo, no implica automaticamente relevancia practica en contextos reales. Del mismo modo, a menudo se usa lenguaje causal cuando los estudios solo muestran correlacion. Una interpretacion responsable exige atender al tamano de muestra, al sesgo de seleccion y a la reproducibilidad, ademas de comunicar con transparencia los margenes de incertidumbre. Periodistas, docentes y asesores de politicas comparten por tanto una responsabilidad: comunicar la evidencia con precision y, a la vez, mantenerla accesible para audiencias no especialistas. Si no se logra ese equilibrio, quienes toman decisiones pueden adoptar narrativas simplistas que ignoran la complejidad y generan intervenciones ineficaces.",
    topicTags: ["academico", "profesional", "sociedad"],
    competencyTags: ["comprension", "produccion", "escritura"],
  },
  {
    id: "c1-professional-1",
    level: "C1",
    duration: "medium",
    topic: "Case note: Stakeholder negotiation",
    textEn:
      "During a multi-stakeholder project, tensions emerged when timelines were revised without prior consultation. Engineering teams prioritized technical feasibility, whereas commercial teams focused on market windows. The project lead reframed the dispute by separating non-negotiable constraints from adjustable deliverables and proposed a phased release. This reframing reduced defensive reactions and enabled a constructive compromise. The episode illustrates how communication quality can determine whether disagreement escalates into conflict or evolves into collaborative problem-solving.",
    textEs:
      "Durante un proyecto con multiples partes interesadas, surgieron tensiones cuando se revisaron plazos sin consulta previa. Los equipos de ingenieria priorizaban viabilidad tecnica, mientras que los equipos comerciales se centraban en ventanas de mercado. La persona responsable del proyecto replanteo la disputa separando restricciones no negociables de entregables ajustables y propuso un lanzamiento por fases. Este replanteamiento redujo reacciones defensivas y permitio un compromiso constructivo. El episodio muestra como la calidad comunicativa puede determinar si un desacuerdo escala a conflicto o evoluciona hacia resolucion colaborativa de problemas.",
    topicTags: ["profesional", "trabajo"],
    competencyTags: ["interaccion", "produccion", "escritura"],
  },
  {
    id: "c2-ethics-1",
    level: "C2",
    duration: "long",
    topic: "Critical text: Ethics of algorithmic decision-making",
    textEn:
      "The deployment of algorithmic decision systems in high-stakes domains has revived an old philosophical tension: whether procedural consistency can substitute for substantive justice. Proponents emphasize scalability and apparent neutrality, yet these claims become fragile when training data encode historical inequities. Even technically well-calibrated models may perpetuate harm if institutional incentives reward speed over accountability. A defensible governance framework must therefore combine rigorous auditability, contestability mechanisms for affected individuals, and independent oversight with real enforcement capacity. Absent these safeguards, organizations risk confusing operational efficiency with ethical legitimacy, thereby eroding public trust in the very systems intended to improve collective outcomes.",
    textEs:
      "La implantacion de sistemas algoritmicos de decision en ambitos de alto impacto ha reactivado una tension filosofica antigua: si la consistencia procedimental puede sustituir a la justicia sustantiva. Quienes los defienden destacan escalabilidad y aparente neutralidad, pero estas afirmaciones se debilitan cuando los datos de entrenamiento incorporan inequidades historicas. Incluso modelos tecnicamente bien calibrados pueden perpetuar dano si los incentivos institucionales premian velocidad por encima de rendicion de cuentas. Un marco de gobernanza defendible debe combinar auditabilidad rigurosa, mecanismos de impugnacion para las personas afectadas y supervision independiente con capacidad real de sancion. Sin esas garantias, las organizaciones corren el riesgo de confundir eficiencia operativa con legitimidad etica, erosionando la confianza publica en sistemas supuestamente disenados para mejorar resultados colectivos.",
    topicTags: ["sociedad", "tecnologia", "academico"],
    competencyTags: ["comprension", "produccion", "escritura"],
  },
  {
    id: "c2-rhetoric-1",
    level: "C2",
    duration: "medium",
    topic: "Advanced narrative: Rhetoric in public discourse",
    textEn:
      "Public rhetoric often persuades less through explicit argument than through strategic framing. By defining what counts as common sense, speakers can narrow the range of acceptable disagreement before any evidence is evaluated. Metaphors are especially potent in this process: they can illuminate complexity, but they can also smuggle assumptions that remain unexamined. Critical literacy at advanced levels therefore requires not only identifying claims and supporting evidence, but also interrogating the conceptual scaffolding that gives those claims intuitive force.",
    textEs:
      "La retorica publica persuade a menudo menos por argumentacion explicita que por encuadre estrategico. Al definir que se considera sentido comun, quienes hablan pueden reducir el rango de desacuerdo aceptable antes de evaluar evidencia alguna. Las metaforas son especialmente poderosas en este proceso: pueden iluminar complejidad, pero tambien introducir supuestos no examinados. La alfabetizacion critica en niveles avanzados exige, por tanto, no solo identificar afirmaciones y evidencias, sino tambien cuestionar la arquitectura conceptual que otorga fuerza intuitiva a esas afirmaciones.",
    topicTags: ["cultura", "sociedad", "academico"],
    competencyTags: ["comprension", "produccion", "escritura"],
  },
];

export function pickRandomReadingFragment(
  level: ReadingLevel,
  duration?: ReadingLength,
  topicFilter?: TopicFilter,
  competencyFocus?: CompetencyFocus
): ReadingFragment {
  const filtered = READING_FRAGMENTS.filter(
    (f) =>
      f.level === level &&
      (!duration || f.duration === duration) &&
      (!topicFilter ||
        topicFilter === "general" ||
        (f.topicTags?.includes(topicFilter) ?? false) ||
        f.topic.toLowerCase().includes(topicFilter)) &&
      (!competencyFocus ||
        (f.competencyTags?.includes(competencyFocus) ?? true))
  );
  const source =
    filtered.length > 0
      ? filtered
      : READING_FRAGMENTS.filter((f) => f.level === level);
  return source[Math.floor(Math.random() * source.length)];
}
