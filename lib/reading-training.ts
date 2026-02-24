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
    topic: "Short story: Morning routine",
    textEn:
      "Every weekday I wake up at seven o'clock. First, I drink a glass of water and open the window to get fresh air. Then I go to the kitchen and prepare a simple breakfast. I usually eat bread, fruit, and yogurt. My sister likes coffee, but I prefer tea with milk. After breakfast, we clean the table together. I brush my teeth, put my books in my bag, and check my phone for the bus time. Before I leave home, I say goodbye to my parents and feed our small cat. It is a quiet routine, but it helps me start the day with energy.",
    textEs:
      "Cada dia de semana me despierto a las siete en punto. Primero, bebo un vaso de agua y abro la ventana para tener aire fresco. Luego voy a la cocina y preparo un desayuno sencillo. Normalmente como pan, fruta y yogur. A mi hermana le gusta el cafe, pero yo prefiero te con leche. Despues del desayuno, limpiamos la mesa juntos. Me lavo los dientes, pongo mis libros en la mochila y miro el movil para ver la hora del autobus. Antes de salir de casa, me despido de mis padres y doy de comer a nuestro gato pequeno. Es una rutina tranquila, pero me ayuda a empezar el dia con energia.",
  },
  {
    id: "a1-city-1",
    level: "A1",
    topic: "Short story: My neighborhood",
    textEn:
      "I live in a small neighborhood near the city center. In the morning, the streets are calm and clean. There is a bakery on the corner, and the smell of fresh bread is everywhere. Next to the bakery, there is a flower shop with red and yellow roses. In the afternoon, many children play in the square. Older people sit on the benches and talk about daily life. On Saturdays, a local market opens in front of the library. You can buy vegetables, cheese, and handmade soap. I like this place because people know each other and always say hello. It feels safe, friendly, and full of simple moments.",
    textEs:
      "Vivo en un barrio pequeno cerca del centro de la ciudad. Por la manana, las calles son tranquilas y limpias. Hay una panaderia en la esquina, y el olor a pan recien hecho esta por todas partes. Al lado de la panaderia, hay una floristeria con rosas rojas y amarillas. Por la tarde, muchos ninos juegan en la plaza. Las personas mayores se sientan en los bancos y hablan de la vida diaria. Los sabados, un mercado local abre delante de la biblioteca. Puedes comprar verduras, queso y jabon artesanal. Me gusta este lugar porque la gente se conoce y siempre saluda. Se siente seguro, amable y lleno de momentos sencillos.",
  },
  {
    id: "a1-shopping-1",
    level: "A1",
    topic: "Short story: At the market",
    textEn:
      "On Friday afternoon, I go to the local market with a short shopping list. I need bread, milk, apples, rice, and eggs for the weekend. The market is busy, but the atmosphere is warm and cheerful. First, I visit the fruit stand and choose red apples and bananas. Then I walk to the dairy section and buy fresh milk and yogurt. I also stop at a small stall that sells homemade jam. The seller lets me taste orange jam, and it is delicious. Before I go home, I check my list again to be sure I have everything. I carry two bags, but I feel happy because my kitchen is ready for the week.",
    textEs:
      "El viernes por la tarde voy al mercado local con una lista corta de compras. Necesito pan, leche, manzanas, arroz y huevos para el fin de semana. El mercado esta lleno, pero el ambiente es calido y alegre. Primero, visito el puesto de fruta y elijo manzanas rojas y platanos. Luego camino a la seccion de lacteos y compro leche fresca y yogur. Tambien paso por un puesto pequeno que vende mermelada casera. La vendedora me deja probar mermelada de naranja, y esta deliciosa. Antes de volver a casa, reviso mi lista otra vez para asegurarme de que tengo todo. Llevo dos bolsas, pero me siento contento porque mi cocina esta lista para la semana.",
  },
  {
    id: "a2-work-1",
    level: "A2",
    topic: "Short story: First week at a new job",
    textEn:
      "This month I started a new job in a small design company. During my first week, everything was new, from the software to the team routines. Every morning we have a short meeting to plan priorities. I usually take notes and ask two or three questions to avoid mistakes later. My manager encourages me to speak in English during meetings, even when I feel nervous. At lunch time, I sit with two colleagues who are patient and friendly. They correct my pronunciation in a respectful way and teach me useful expressions. At the end of the day, I review my tasks and prepare a simple to-do list for tomorrow. The routine is demanding, but I can already see my confidence growing.",
    textEs:
      "Este mes empece un nuevo trabajo en una pequena empresa de diseno. Durante mi primera semana, todo era nuevo, desde el software hasta las rutinas del equipo. Cada manana tenemos una reunion corta para planificar prioridades. Normalmente tomo notas y hago dos o tres preguntas para evitar errores despues. Mi responsable me anima a hablar en ingles durante las reuniones, incluso cuando me pongo nervioso. A la hora de comer, me siento con dos companeros pacientes y amables. Corrigen mi pronunciacion con respeto y me ensenan expresiones utiles. Al final del dia, reviso mis tareas y preparo una lista sencilla para manana. La rutina es exigente, pero ya puedo ver que mi confianza crece.",
  },
  {
    id: "a2-health-1",
    level: "A2",
    topic: "Short story: Building healthy habits",
    textEn:
      "At the beginning of the year, I decided to improve my health with small daily habits. I started by walking twenty minutes after dinner, three days per week. After two weeks, I felt better and added short morning stretches at home. I also changed my breakfast and included fruit, oats, and more water. On weekends, I cook simple meals for the next few days to avoid fast food. Sometimes I still feel tired, especially after long workdays, but I try to stay consistent. My friend joined me, and now we motivate each other. We share progress messages and celebrate small wins. These changes are not dramatic, but they make my body stronger and my mind calmer.",
    textEs:
      "Al principio del ano, decidi mejorar mi salud con pequenos habitos diarios. Empece caminando veinte minutos despues de cenar, tres dias por semana. Tras dos semanas, me senti mejor y anadi estiramientos cortos por la manana en casa. Tambien cambie mi desayuno e inclui fruta, avena y mas agua. Los fines de semana cocino comidas sencillas para varios dias y asi evito comida rapida. A veces sigo cansado, sobre todo despues de dias largos de trabajo, pero intento mantener la constancia. Un amigo se unio a mi, y ahora nos motivamos mutuamente. Compartimos mensajes de progreso y celebramos pequenas victorias. Estos cambios no son dramaticos, pero hacen mi cuerpo mas fuerte y mi mente mas tranquila.",
  },
  {
    id: "a2-travel-1",
    level: "A2",
    topic: "Short story: Weekend trip by train",
    textEn:
      "Last spring, I took a weekend train trip with two friends to a town near the sea. We left early on Saturday with backpacks, snacks, and a printed map. When we arrived, the station was small but full of light. First, we walked through the old streets and took photos of colorful buildings. Later, we found a restaurant run by a local family and tried fresh fish with lemon rice. In the afternoon, we visited a small museum about local history and traditions. Before sunset, we sat on the beach and listened to the waves. On Sunday morning, we bought postcards and coffee before returning home. It was a short trip, but it gave us new energy for the week.",
    textEs:
      "La primavera pasada hice un viaje de fin de semana en tren con dos amigos a un pueblo cerca del mar. Salimos temprano el sabado con mochilas, comida y un mapa impreso. Cuando llegamos, la estacion era pequena pero muy luminosa. Primero caminamos por las calles antiguas y tomamos fotos de edificios de colores. Despues encontramos un restaurante de una familia local y probamos pescado fresco con arroz al limon. Por la tarde visitamos un pequeno museo sobre historia y tradiciones del lugar. Antes del atardecer, nos sentamos en la playa y escuchamos las olas. El domingo por la manana compramos postales y cafe antes de volver a casa. Fue un viaje corto, pero nos dio nueva energia para la semana.",
  },
  {
    id: "b1-learning-1",
    level: "B1",
    topic: "Short story: A method that finally worked",
    textEn:
      "For years, I tried to improve my English with long study sessions on weekends, but I always forgot what I learned. Three months ago, I changed my strategy completely. Instead of studying for three hours once a week, I now practice twenty-five minutes every day and review my notes on Sundays. During weekdays, I focus on one skill at a time: listening on Monday, speaking on Tuesday, reading on Wednesday, and writing on Thursday. Friday is my mixed practice day, when I use everything together in short tasks. I also record myself reading short texts and compare my pronunciation every two weeks. This routine is easier to maintain, and my progress is clearer. I still make mistakes, but now I can identify patterns and correct them faster.",
    textEs:
      "Durante anos intente mejorar mi ingles con sesiones largas los fines de semana, pero siempre olvidaba lo aprendido. Hace tres meses cambie mi estrategia por completo. En lugar de estudiar tres horas una vez por semana, ahora practico veinticinco minutos cada dia y reviso mis apuntes los domingos. Entre semana me concentro en una habilidad cada dia: listening el lunes, speaking el martes, reading el miercoles y writing el jueves. El viernes hago practica mixta para combinar todo en tareas cortas. Tambien me grabo leyendo textos breves y comparo mi pronunciacion cada dos semanas. Esta rutina es mas facil de mantener y mi progreso es mas visible. Sigo cometiendo errores, pero ahora detecto patrones y los corrijo mas rapido.",
  },
  {
    id: "b1-technology-1",
    level: "B1",
    topic: "Short story: Learning with digital tools",
    textEn:
      "My brother and I are both learning languages, but we use technology in different ways. He prefers video lessons and interactive games, while I like podcasts, digital flashcards, and online conversation clubs. At first, I thought his method was too casual, but I noticed he was building confidence quickly. He practiced daily without feeling tired, because his activities were short and varied. I learned from that and redesigned my routine. Now I combine a reading app, a pronunciation tool, and one weekly conversation session with native speakers. However, technology is not enough by itself. We still need discipline, reflection, and clear goals. The best results come when digital tools support a smart plan instead of replacing it.",
    textEs:
      "Mi hermano y yo estamos aprendiendo idiomas, pero usamos la tecnologia de forma diferente. El prefiere videos y juegos interactivos, mientras yo prefiero podcasts, tarjetas digitales y clubes de conversacion en linea. Al principio pense que su metodo era demasiado informal, pero note que ganaba confianza muy rapido. Practicaba cada dia sin cansarse porque sus actividades eran cortas y variadas. Aprendi de eso y rediseñe mi rutina. Ahora combino una app de lectura, una herramienta de pronunciacion y una sesion semanal de conversacion con hablantes nativos. Sin embargo, la tecnologia por si sola no basta. Seguimos necesitando disciplina, reflexion y objetivos claros. Los mejores resultados llegan cuando las herramientas digitales apoyan un plan inteligente, no cuando lo sustituyen.",
  },
  {
    id: "b1-environment-1",
    level: "B1",
    topic: "Short story: The community garden project",
    textEn:
      "Two years ago, an empty lot near our building was full of trash and broken furniture. A local teacher suggested creating a community garden, and little by little the idea became real. First, volunteers cleaned the area and built small wooden boxes for planting. Later, families brought seeds, tools, and old containers for recycling water. Children painted signs with plant names in two languages, and older neighbors shared practical tips about seasons and soil. Today the garden produces tomatoes, herbs, and lettuce for many homes in the street. More importantly, it changed the way people relate to each other. Neighbors who never spoke now cooperate every weekend. The project does not solve every environmental problem, but it proves that small local actions can create meaningful change.",
    textEs:
      "Hace dos anos, un solar vacio cerca de nuestro edificio estaba lleno de basura y muebles rotos. Una profesora local propuso crear un huerto comunitario y, poco a poco, la idea se hizo realidad. Primero, voluntarios limpiaron la zona y construyeron cajas de madera para plantar. Despues, las familias trajeron semillas, herramientas y recipientes usados para reciclar agua. Los ninos pintaron carteles con nombres de plantas en dos idiomas, y los vecinos mayores compartieron consejos practicos sobre estaciones y tierra. Hoy el huerto produce tomates, hierbas y lechuga para muchas casas de la calle. Lo mas importante es que cambio la forma en que las personas se relacionan. Vecinos que nunca hablaban ahora cooperan cada fin de semana. El proyecto no resuelve todos los problemas ambientales, pero demuestra que acciones locales pequenas pueden crear cambios significativos.",
  },
];

export function pickRandomReadingFragment(level: ReadingLevel): ReadingFragment {
  const filtered = READING_FRAGMENTS.filter((f) => f.level === level);
  const source = filtered.length > 0 ? filtered : READING_FRAGMENTS;
  return source[Math.floor(Math.random() * source.length)];
}
