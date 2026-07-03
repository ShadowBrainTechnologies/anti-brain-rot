import { useCallback, useEffect, useState } from 'react'
import { getBest, saveBest, formatBest } from '../data/scores.js'
import './AttentionIsAllYouNeed.css'

const READING_TIME_MS = 25000
const QUESTIONS_PER_STORY = 3

// Stories with reading-comprehension questions.
const STORIES = [
  {
    title: "The Last Clockmaker",
    text: `In a town where every clock stopped at midnight, one old clockmaker named Elias kept working. People said time had forgotten them, but Elias believed the opposite. Every morning he wound the town's tallest clock, a brass tower at the center of the square, even though its hands never moved. One winter evening, a young girl asked him why he bothered. Elias smiled and handed her a tiny silver key. "Because," he said, "the moment we stop winding is the moment we truly stop." That night, for the first time in forty years, the clock struck one.`,
    questions: [
      {
        text: "Why did the people of the town think time had forgotten them?",
        options: [
          "Every clock in town stopped at midnight.",
          "Elias never spoke to them.",
          "The sun never rose in winter.",
          "No children were born there.",
        ],
        answer: 0,
      },
      {
        text: "What did Elias give to the young girl?",
        options: [
          "A brass clock hand",
          "A tiny silver key",
          "A pocket watch",
          "A drawing of the tower",
        ],
        answer: 1,
      },
      {
        text: "When did the clock strike again for the first time?",
        options: [
          "At midnight",
          "At noon the next day",
          "At one in the morning",
          "During Elias's funeral",
        ],
        answer: 2,
      },
    ],
  },
  {
    title: "The Forgotten Lighthouse",
    text: `On a rocky cliff at the edge of the world stood a lighthouse no ship had seen in decades. Its keeper, Mara, climbed the spiral stairs every evening with an empty oil can. She no longer lit the lamp, but she polished the glass and swept the dust. One stormy night, a lost sailor knocked on her door, shivering and soaked. "The light is out," he whispered. Mara handed him a blanket and struck a single match. "It was never for the ships," she said, lighting the lamp. "It was for anyone who still believes someone is waiting." The beam cut through the rain for miles.`,
    questions: [
      {
        text: "Where did the lighthouse stand?",
        options: [
          "In a busy harbor",
          "On a rocky cliff",
          "On a sandy beach",
          "In a fishing village",
        ],
        answer: 1,
      },
      {
        text: "What did Mara light during the storm?",
        options: ["A candle", "A bonfire", "The lighthouse lamp", "A lantern"],
        answer: 2,
      },
      {
        text: "Who knocked on Mara's door?",
        options: ["A fisherman", "A lost sailor", "A merchant", "A child"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Baker's Secret",
    text: `Every morning before dawn, an old baker named Theo placed a single loaf of bread on the windowsill. The villagers thought it was a display, but each evening the loaf was gone. No one ever saw who took it. One rainy morning, a hungry boy named Leo peered through the glass and saw Theo whispering to the bread. Embarrassed, Theo confessed that he once stole a loaf as a child, and a stranger's kindness saved his family. "Now I repay the debt," he said, "one loaf at a time." Leo smiled and left a coin he could not afford.`,
    questions: [
      {
        text: "Where did Theo place the loaf each morning?",
        options: ["On the counter", "In the oven", "On the windowsill", "By the door"],
        answer: 2,
      },
      {
        text: "Why did Theo give away the bread?",
        options: [
          "He had too much flour",
          "A stranger once helped him when he was hungry",
          "The village paid him to do it",
          "He wanted to win a contest",
        ],
        answer: 1,
      },
      {
        text: "What did Leo leave behind?",
        options: ["A note", "A coin", "A flower", "A drawing"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Midnight Train",
    text: `A train ran through the mountains at midnight, though no schedule listed it. Passengers who boarded spoke of dreams they could not finish. One autumn, a woman named Clara stepped on clutching a sealed letter. She rode in silence until the conductor asked for her destination. "I don't know," she said. "But the letter will tell me when I get there." At the seventh tunnel, the letter grew warm in her hands. She opened it and found only a mirror. By its reflection, she saw she had arrived at the person she wanted to become.`,
    questions: [
      {
        text: "When did the mysterious train run?",
        options: ["At noon", "At sunset", "At midnight", "At dawn"],
        answer: 2,
      },
      {
        text: "What was Clara holding when she boarded?",
        options: ["A suitcase", "A sealed letter", "A map", "A ticket"],
        answer: 1,
      },
      {
        text: "What was inside the letter?",
        options: ["Money", "A mirror", "A name", "A poem"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Painter's Garden",
    text: `An elderly painter named Silvia had not sold a canvas in twenty years, yet every spring she painted the same abandoned garden on the hill. Neighbors called her foolish until a developer arrived to build apartments on the site. Silvia showed the town her paintings from decades past, each one blooming with flowers that no longer grew there. The council declared the garden a protected landmark. On opening day, children planted seeds among the stones. Silvia watched from her window, brush in hand, finally ready to paint something new.`,
    questions: [
      {
        text: "What did Silvia paint every spring?",
        options: ["Her house", "The town square", "An abandoned garden", "The sea"],
        answer: 2,
      },
      {
        text: "Who wanted to build on the garden?",
        options: ["A farmer", "A developer", "The council", "A neighbor"],
        answer: 1,
      },
      {
        text: "What saved the garden?",
        options: [
          "Silvia's paintings proved its historical value",
          "A wealthy donor bought it",
          "The developer changed his mind",
          "It was buried under snow",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Lost Violin",
    text: `In a dusty pawnshop, a violin waited fifty years for its owner. The shopkeeper, Mr. Hallow, dusted it daily though no one ever asked to play it. One afternoon, a young woman entered and pressed her palm against the case. "This was my grandmother's," she said. Mr. Hallow handed her the instrument without charge. When she drew the bow across the strings, the shop filled with a melody Mr. Hallow had never heard, yet somehow always remembered. He locked the shop early that day and walked home whistling.`,
    questions: [
      {
        text: "How long had the violin waited in the shop?",
        options: ["Ten years", "Twenty years", "Fifty years", "A century"],
        answer: 2,
      },
      {
        text: "Who claimed the violin?",
        options: ["A young man", "A young woman", "Mr. Hallow", "A musician"],
        answer: 1,
      },
      {
        text: "What did Mr. Hallow do after hearing the music?",
        options: [
          "Raised the price",
          "Locked the shop early and walked home whistling",
          "Asked for a lesson",
          "Called the police",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Silent Bell",
    text: `At the village church, the bell had not rung since the great fire. Father Tomas climbed the tower every morning anyway, running his hand along the rope. Visitors asked why he bothered. "Silence is also a prayer," he would reply. One morning, a deaf child named Milo followed him up. He placed his small hand on the bell and felt the vibration of the wind. His eyes widened. Father Tomas rang the bell softly, and though Milo heard nothing, he laughed because he felt the sound in his bones. The village wept below, finally understanding.`,
    questions: [
      {
        text: "Why had the bell not rung?",
        options: [
          "It was broken in a great fire",
          "The rope was missing",
          "The village forbade it",
          "Father Tomas was ill",
        ],
        answer: 0,
      },
      {
        text: "Who followed Father Tomas into the tower?",
        options: ["A tourist", "A deaf child named Milo", "The mayor", "A musician"],
        answer: 1,
      },
      {
        text: "How did Milo experience the bell?",
        options: [
          "He heard it loudly",
          "He felt its vibration",
          "He saw it move",
          "He smelled the metal",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Map Seller",
    text: `In a market of oddities, a blind man sold maps that no one could read. The lines shifted when touched, and the place names were in languages no scholar recognized. A curious traveler bought one and followed it into the desert. For three days he wandered, growing thirstier and angrier. On the fourth dawn, he reached a well no chart had ever marked. As he drank, he realized the map had not led him to water. It had led him to the moment he finally stopped looking for shortcuts.`,
    questions: [
      {
        text: "Who sold the strange maps?",
        options: ["A sailor", "A blind man", "A merchant", "A king"],
        answer: 1,
      },
      {
        text: "Where did the traveler follow the map?",
        options: ["Into the mountains", "Into the desert", "Across the sea", "Underground"],
        answer: 1,
      },
      {
        text: "What did the traveler realize at the well?",
        options: [
          "He was lost forever",
          "The map led him to stop looking for shortcuts",
          "He should sell maps too",
          "The water was poisoned",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Glassblower's Daughter",
    text: `Every summer, the glassblower's daughter made a single blue marble and threw it into the river. The villagers thought it was waste, but she insisted the river needed something beautiful to carry to the sea. One dry season, the riverbed cracked and children found hundreds of blue marbles glittering in the mud. They gathered them like treasure, and the glassblower's daughter smiled. "The river kept them safe," she said, "and now it gives them back when we need color most."`,
    questions: [
      {
        text: "What did the glassblower's daughter make each summer?",
        options: ["A red vase", "A blue marble", "A green bottle", "A yellow bead"],
        answer: 1,
      },
      {
        text: "Where did she throw the marble?",
        options: ["Into the well", "Into the river", "Into the ocean", "Into a fire"],
        answer: 1,
      },
      {
        text: "When were the marbles found?",
        options: ["During a flood", "During a dry season", "At winter", "At midnight"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Last Letter",
    text: `A postman named Jonah delivered a letter addressed to a house that had burned down thirty years ago. The return name was his own. Inside was a single sentence: "Forgive the boy who was afraid to say goodbye." Jonah sat on the blackened steps and wept. As a child, he had run from his best friend's funeral and never spoke of him again. That evening, Jonah visited the old cemetery and placed the letter beneath a stone. The wind carried the scent of rain and something like peace.`,
    questions: [
      {
        text: "To what kind of house was the letter addressed?",
        options: [
          "A new mansion",
          "A house that had burned down",
          "A lighthouse",
          "A castle",
        ],
        answer: 1,
      },
      {
        text: "What was inside the letter?",
        options: [
          "A single sentence about forgiveness",
          "A large sum of money",
          "A map",
          "A poem",
        ],
        answer: 0,
      },
      {
        text: "Where did Jonah place the letter?",
        options: [
          "In a mailbox",
          "Beneath a stone in the cemetery",
          "In his pocket",
          "On his desk",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Umbrella Shop",
    text: `In a city where it never rained, an old woman named Mrs. Finch sold umbrellas. Tourists bought them as jokes until the day the sky turned gray and did not stop. People flooded her tiny shop, but she had only one umbrella left. She gave it to a young mother holding a baby. "I've waited sixty years for this," Mrs. Finch said, "and I can wait a little longer." The mother tried to pay, but Mrs. Finch shook her head. Some things, she said, were meant to be given away at exactly the right moment.`,
    questions: [
      {
        text: "What did Mrs. Finch sell?",
        options: ["Hats", "Umbrellas", "Shoes", "Books"],
        answer: 1,
      },
      {
        text: "Who received the last umbrella?",
        options: ["A tourist", "A young mother with a baby", "An old man", "A child"],
        answer: 1,
      },
      {
        text: "How long had Mrs. Finch waited for rain?",
        options: ["Six years", "Sixty years", "Ten years", "One year"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Night Gardener",
    text: `Someone watered the town's flowers after dark. Every morning, the wilted petals stood fresh, and no one knew who to thank. A boy named Nico hid behind a bench until he saw a thin man in a long coat carrying a watering can. The man moved like a shadow from planter to planter. When Nico asked his name, the man smiled and said, "I'm just someone who cannot sleep and prefers to grow things instead of worry." Nico began joining him, learning that kindness can bloom quietly in the dark.`,
    questions: [
      {
        text: "When did the mysterious gardener water the flowers?",
        options: ["At noon", "After dark", "At dawn", "During a storm"],
        answer: 1,
      },
      {
        text: "Who discovered the gardener?",
        options: ["A girl", "A boy named Nico", "The mayor", "A police officer"],
        answer: 1,
      },
      {
        text: "What did the gardener prefer to do instead of worrying?",
        options: ["Read", "Sleep", "Grow things", "Walk"],
        answer: 2,
      },
    ],
  },
  {
    title: "The Watchmaker's Apprentice",
    text: `A young apprentice named Rin asked the watchmaker why he repaired clocks no one wanted. The old man opened a drawer full of dusty timepieces, each labeled with a name. "Every clock holds a promise someone made," he said. "When I fix it, I'm keeping that promise alive a little longer." Rin spent months learning the craft, and on his final day, the watchmaker handed him a silver watch with no owner. "Your first promise is to yourself," he said. "Don't waste it."`,
    questions: [
      {
        text: "What was the apprentice's name?",
        options: ["Silas", "Rin", "Milo", "Jonah"],
        answer: 1,
      },
      {
        text: "What did the watchmaker keep in his drawer?",
        options: [
          "Dusty clocks labeled with names",
          "Letters from customers",
          "Gold coins",
          "Painting supplies",
        ],
        answer: 0,
      },
      {
        text: "What did the watchmaker give Rin on his final day?",
        options: [
          "A gold coin",
          "A silver watch with no owner",
          "A book of names",
          "A set of keys",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Stone Carver",
    text: `On a hillside above the harbor, a stone carver named Gareth spent thirty years carving faces into the cliffs. Sailors used them to find their way home. When Gareth grew too old to climb, the town offered to finish his work, but he refused. "They aren't maps," he explained. "They are the faces of everyone who ever waited for someone to return." Years later, a sailor recognized his own mother's face in the stone and wept. The cliffs had become a library of longing.`,
    questions: [
      {
        text: "What did Gareth carve into the cliffs?",
        options: ["Ships", "Faces", "Maps", "Names"],
        answer: 1,
      },
      {
        text: "Who used the carvings to find their way home?",
        options: ["Farmers", "Sailors", "Merchants", "Children"],
        answer: 1,
      },
      {
        text: "What did the cliffs become?",
        options: [
          "A library of longing",
          "A place for birds",
          "A prison",
          "A marketplace",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Ferryman's Promise",
    text: `An old ferryman rowed travelers across the misty river for a single coin, but he never kept the money. Instead, he dropped each coin into the water, saying it was payment for the river itself. One day, a soldier asked what would happen if the river demanded too much. The ferryman laughed and pointed to his empty pockets. "Then I will have paid everything I owe, and the river will owe me a ride home." When he finally stopped rowing, the mist parted, and a boat made of silver coins carried him away.`,
    questions: [
      {
        text: "What did the ferryman charge for a ride?",
        options: ["A silver coin", "A single coin", "A flower", "Nothing"],
        answer: 1,
      },
      {
        text: "What did he do with the coins?",
        options: [
          "Bought food",
          "Dropped them into the river",
          "Saved them in a chest",
          "Gave them to the poor",
        ],
        answer: 1,
      },
      {
        text: "How did the ferryman leave at the end?",
        options: [
          "In a boat made of silver coins",
          "By walking across a bridge",
          "He disappeared into mist",
          "A horse carried him",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Book Mender",
    text: `In a library basement, a woman named Alma repaired broken books. She used thread the color of old paper and glue that smelled like rain. Children brought her torn pages, and she always asked, "How did the story hurt itself?" One shy girl brought a book with its spine cracked in two. "It fell when I ran away from home," she admitted. Alma mended it and wrote inside the cover: "Stories can be put back together. So can people." The girl kept the book close for the rest of her life.`,
    questions: [
      {
        text: "What was Alma's job?",
        options: ["She repaired books", "She wrote stories", "She sold glue", "She taught children"],
        answer: 0,
      },
      {
        text: "What did Alma ask children when they brought torn pages?",
        options: [
          '"How did the story hurt itself?"',
          '"Who did this?"',
          '"Where is your mother?"',
          '"Can you pay?"',
        ],
        answer: 0,
      },
      {
        text: "What did Alma write inside the cracked book?",
        options: [
          '"Be careful next time."',
          '"Stories can be put back together. So can people."',
          '"Return by Friday."',
          '"This book is broken."',
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Snow Globe Collector",
    text: `An old man named Wallace collected snow globes, but he never shook them. "The snow is already falling in there," he told visitors. "It just needs someone patient enough to watch." One winter, a grieving widow sat in his shop for hours, staring at a globe that held a tiny cottage. Slowly, the flakes drifted down without a single shake. She bought it and placed it on her nightstand. That night, she slept through until morning for the first time since her husband died.`,
    questions: [
      {
        text: "What did Wallace collect?",
        options: ["Stamps", "Snow globes", "Books", "Coins"],
        answer: 1,
      },
      {
        text: "Why did Wallace never shake the globes?",
        options: [
          "He was too weak",
          "He believed the snow fell on its own for patient watchers",
          "He was afraid they would break",
          "The globes were broken",
        ],
        answer: 1,
      },
      {
        text: "Who bought the cottage snow globe?",
        options: ["A child", "A grieving widow", "A sailor", "Wallace himself"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Candle Maker",
    text: `In a village that lost its electricity every winter, a candle maker named Beatrice added a pinch of salt to each wick. People asked why, and she said salt made the flame remember the sun. Skeptics laughed until the longest night of the year, when all other candles sputtered and died. Only Beatrice's candles burned steady, casting warm light on the village square. Children danced in the glow, and the old remembered summers long past. Beatrice simply smiled and dipped another wick.`,
    questions: [
      {
        text: "What did Beatrice add to each wick?",
        options: ["Sugar", "Salt", "Pepper", "Honey"],
        answer: 1,
      },
      {
        text: "Why did she add it?",
        options: [
          "To make the candle smell good",
          "To make the flame remember the sun",
          "To make the candle burn faster",
          "To color the flame",
        ],
        answer: 1,
      },
      {
        text: "When did Beatrice's candles prove their worth?",
        options: [
          "On the longest night",
          "During a summer festival",
          "At noon",
          "During a wedding",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Thread Spinner",
    text: `A spinner named Lira made thread so fine it could catch moonlight. Kings offered her gold, but she only sold to those who needed to mend something precious. A soldier came with a torn battle flag. A mother came with a child's blanket. Each left with thread that glowed faintly in the dark. When Lira died, the village found her loom empty except for one unfinished strand. They followed it through the streets and discovered every tear she had ever mended still shining softly in the night.`,
    questions: [
      {
        text: "What was special about Lira's thread?",
        options: [
          "It was very thick",
          "It could catch moonlight",
          "It was made of gold",
          "It never broke",
        ],
        answer: 1,
      },
      {
        text: "Who did Lira sell her thread to?",
        options: [
          "Only kings",
          "Those who needed to mend something precious",
          "Only soldiers",
          "Only mothers",
        ],
        answer: 1,
      },
      {
        text: "What did the village discover after Lira died?",
        options: [
          "Her hidden gold",
          "Every mend she made still shone in the dark",
          "A secret recipe",
          "A map",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Mirror Merchant",
    text: `A merchant sold mirrors that showed not your face, but the last place you felt truly at home. Most customers wept or laughed, but a few turned away in fear. One day, a wealthy man bought every mirror in the shop and smashed them in the street. "No one should be reminded of what they've lost," he shouted. The merchant swept up the shards and gave one to a passing orphan. In it, the boy saw the bakery where a stranger once gave him bread. He kept it forever.`,
    questions: [
      {
        text: "What did the merchant's mirrors show?",
        options: [
          "Your future",
          "The last place you felt truly at home",
          "Your worst fear",
          "Hidden treasure",
        ],
        answer: 1,
      },
      {
        text: "What did the wealthy man do with the mirrors?",
        options: ["He sold them", "He smashed them", "He gave them away", "He hung them in his house"],
        answer: 1,
      },
      {
        text: "What did the orphan see in his mirror shard?",
        options: [
          "A bakery where a stranger gave him bread",
          "His parents",
          "A castle",
          "The merchant's shop",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Song Thief",
    text: `In a kingdom where music was taxed, a thief named Kael stole songs instead of gold. He hummed forbidden melodies in the marketplace, then slipped away before the guards arrived. One evening, he was caught by a young soldier who simply asked, "Why?" Kael replied that his mother had forgotten how to sing, and he was collecting every song she ever loved. The soldier let him go and later hummed one of the tunes outside his own window. His sister, ill for years, began to sing along.`,
    questions: [
      {
        text: "What did Kael steal?",
        options: ["Gold", "Songs", "Jewels", "Food"],
        answer: 1,
      },
      {
        text: "Why did Kael steal songs?",
        options: [
          "To sell them",
          "His mother had forgotten how to sing",
          "To impress a girl",
          "To become famous",
        ],
        answer: 1,
      },
      {
        text: "Who began to sing along when the soldier hummed?",
        options: ["His mother", "His sister", "Kael", "The guards"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Seed Keeper",
    text: `During a famine, a farmer named Oren buried his last sack of seeds in the forest rather than eat them. His family called him a fool. Years later, when the famine returned, Oren led the villagers to the hidden grove. Trees heavy with fruit swayed above them. "I wasn't saving seeds," he said. "I was saving tomorrow." The children climbed the trees while the elders wept. No one went hungry that winter, and every spring after, they planted a new grove for the future.`,
    questions: [
      {
        text: "What did Oren bury in the forest?",
        options: ["Gold", "His last sack of seeds", "A treasure map", "Food"],
        answer: 1,
      },
      {
        text: "What grew from the buried seeds?",
        options: ["Flowers", "Trees heavy with fruit", "Houses", "Rivers"],
        answer: 1,
      },
      {
        text: "What did Oren say he was saving?",
        options: ["Money", "Tomorrow", "His reputation", "The forest"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Clock Tower",
    text: `A clock tower in the city rang thirteen times every noon, though no mechanism explained the extra chime. Engineers inspected it for years and found nothing wrong. One day, a poet named Isla climbed the tower at dawn and sat beneath the bells. At noon, the twelfth chime sounded, followed by a soft thirteenth note. She realized it was not a malfunction but an echo of the city's unspoken wishes. From then on, citizens made a wish at the thirteenth chime, and sometimes, just sometimes, it came true.`,
    questions: [
      {
        text: "How many times did the clock ring at noon?",
        options: ["Twelve", "Thirteen", "One", "Twenty-four"],
        answer: 1,
      },
      {
        text: "Who climbed the tower at dawn?",
        options: ["An engineer", "A poet named Isla", "A child", "The mayor"],
        answer: 1,
      },
      {
        text: "What did Isla believe the thirteenth chime was?",
        options: [
          "A malfunction",
          "An echo of the city's unspoken wishes",
          "A ghost",
          "A mistake in the mechanism",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Memory Jar",
    text: `An alchemist sold jars that could hold a single memory. Customers paid with their saddest recollection, leaving the shop lighter. A young man named Vero sold the memory of his first love and immediately felt nothing for her. Years later, wealthy and lonely, he bought back every jar he had sold. When he opened his own, he wept, because the memory was not of love but of how kindness felt before the world taught him to want more. He returned the jars and walked home poorer and free.`,
    questions: [
      {
        text: "What did the alchemist's jars hold?",
        options: ["Perfume", "A single memory", "Coins", "Food"],
        answer: 1,
      },
      {
        text: "What did customers pay with?",
        options: [
          "Gold",
          "Their saddest recollection",
          "A promise",
          "A song",
        ],
        answer: 1,
      },
      {
        text: "What did Vero realize when he opened his jar?",
        options: [
          "He had forgotten love",
          "The memory was of kindness before greed",
          "The jar was empty",
          "He was rich",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Salt Merchant",
    text: `A merchant sold salt from a cart at the crossroads. Travelers complained his salt was too expensive until they tasted their bread without it. One rainy season, the roads flooded and no supplies reached the town. The merchant opened his cart and gave away every grain. "Salt is only valuable when it is shared," he said. After the waters receded, the town built him a stone house by the crossroads. Travelers still stop there, leaving a pinch of salt on the windowsill as thanks.`,
    questions: [
      {
        text: "What did the merchant sell?",
        options: ["Sugar", "Salt", "Spices", "Bread"],
        answer: 1,
      },
      {
        text: "What happened during the rainy season?",
        options: [
          "The roads flooded",
          "The town moved away",
          "The merchant raised prices",
          "The salt turned to gold",
        ],
        answer: 0,
      },
      {
        text: "What did travelers leave on the windowsill?",
        options: ["Coins", "A pinch of salt", "Flowers", "Letters"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Lantern Bearer",
    text: `Every evening at dusk, a child named Perrin lit the lanterns along the dark forest path. Adults warned him of wolves, but Perrin said the woods needed light more than he needed fear. One night, a frightened deer followed him from lamp to lamp, and soon after, a lost traveler appeared. The man offered Perrin a gold coin, but Perrin refused. "Carry a lantern tomorrow," he said. The traveler did, and the forest path became a chain of lights that no wolf would cross.`,
    questions: [
      {
        text: "Who lit the forest lanterns?",
        options: ["An old man", "A child named Perrin", "A soldier", "A merchant"],
        answer: 1,
      },
      {
        text: "What followed Perrin one night?",
        options: ["A wolf", "A frightened deer", "A ghost", "A dog"],
        answer: 1,
      },
      {
        text: "What did Perrin ask the traveler to do instead of paying?",
        options: [
          "Carry a lantern tomorrow",
          "Plant a tree",
          "Sing a song",
          "Leave the forest",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Key Collector",
    text: `A woman named Yara collected keys that no longer opened anything. She hung them on strings across her ceiling, and when the wind blew through her window, they chimed like a thousand tiny bells. A locksmith asked why she bothered with rusted metal. "Every key once opened a door someone cared about," she said. One night, a young couple arrived holding an old brass key. Yara returned it to them, and they discovered it opened a trunk in their attic containing letters from their great-grandparents. Some doors open in time, not space.`,
    questions: [
      {
        text: "What did Yara collect?",
        options: ["Coins", "Keys", "Bells", "Books"],
        answer: 1,
      },
      {
        text: "Where did she hang the keys?",
        options: [
          "On the wall",
          "On strings across her ceiling",
          "In boxes",
          "Outside her door",
        ],
        answer: 1,
      },
      {
        text: "What did the brass key open?",
        options: [
          "Yara's door",
          "A trunk with letters from great-grandparents",
          "A treasure chest",
          "A locked gate",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Weather Vane",
    text: `On the tallest barn in the valley sat a weather vane that always pointed west, no matter how the wind blew. Farmers used it as a joke until a drought came and the vane suddenly swung east. An old woman named Greta packed her wagon and followed the direction it pointed. Three days later, she found a hidden spring in the eastern hills. The village built a pipeline from the spring, and the weather vane returned to pointing west, as if its work were done.`,
    questions: [
      {
        text: "Which direction did the weather vane usually point?",
        options: ["North", "East", "South", "West"],
        answer: 3,
      },
      {
        text: "What happened during the drought?",
        options: [
          "The vane swung east",
          "The vane fell off",
          "The barn burned down",
          "The wind stopped forever",
        ],
        answer: 0,
      },
      {
        text: "Who followed the vane and found water?",
        options: ["Greta", "A farmer", "A child", "The mayor"],
        answer: 0,
      },
    ],
  },
  {
    title: "The Paper Bird Maker",
    text: `In a city of concrete, an old man named Hiro folded paper birds on the subway steps. Passersby dropped coins, but he never looked up. One winter, a sick girl asked him to teach her. Her hands shook too much to fold, so Hiro made the birds and she painted them. They sold every bird and paid for her medicine. Years later, the girl became a doctor and covered her office ceiling with paper birds. Each one held a note: "For Hiro, who taught me that flight begins on the ground."`,
    questions: [
      {
        text: "What did Hiro fold?",
        options: ["Boats", "Paper birds", "Hats", "Boxes"],
        answer: 1,
      },
      {
        text: "Why couldn't the girl fold the birds herself?",
        options: [
          "She was too young",
          "Her hands shook too much",
          "She was blind",
          "She was afraid of paper",
        ],
        answer: 1,
      },
      {
        text: "What profession did the girl eventually have?",
        options: ["A teacher", "A doctor", "A painter", "A pilot"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Silent Orchestra",
    text: `In a town where sound was forbidden after sunset, a group of musicians met in the old subway tunnels. They played without instruments, moving their hands over imaginary strings and pressing silent keys. A deaf girl named Aria discovered them and asked to join. She could not hear their music, but she felt the rhythm through the floor. One night, she led them above ground at dawn and they performed a real symphony. The town, waking to the sound, chose to lift the curfew forever.`,
    questions: [
      {
        text: "Where did the silent orchestra meet?",
        options: [
          "In a concert hall",
          "In old subway tunnels",
          "In a church",
          "In the forest",
        ],
        answer: 1,
      },
      {
        text: "How did Aria experience the music?",
        options: [
          "She heard it faintly",
          "She felt the rhythm through the floor",
          "She read the sheet music",
          "She watched the conductor",
        ],
        answer: 1,
      },
      {
        text: "What happened after the dawn performance?",
        options: [
          "The town lifted the sound curfew",
          "The musicians were arrested",
          "The subway collapsed",
          "Aria left town",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Button Seller",
    text: `A woman named Mina sold buttons from a tiny cart. Each button, she claimed, came from a coat that had once kept someone brave warm. A shy actor bought a silver button before his first play and found his stage fright vanished. A farmer bought a wooden button and spoke at the town meeting for the first time. Skeptics said it was superstition, but Mina simply smiled. "Courage isn't in the button," she said. "It's in the hand that sews it on."`,
    questions: [
      {
        text: "What did Mina sell?",
        options: ["Ribbons", "Buttons", "Thread", "Needles"],
        answer: 1,
      },
      {
        text: "Who bought a silver button?",
        options: ["A farmer", "A shy actor", "A soldier", "A child"],
        answer: 1,
      },
      {
        text: "What did Mina say courage was in?",
        options: [
          "The button itself",
          "The hand that sews it on",
          "The coat it came from",
          "The cart",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Lake House",
    text: `For fifty summers, a family returned to a wooden house beside a clear lake. The last summer, the grandmother arrived alone. She sat on the porch each evening, talking to the empty chairs. Neighbors thought grief had changed her until they noticed the chairs were arranged just as the family always had. "I'm not talking to ghosts," she explained. "I'm keeping the conversation warm until they come back." The next summer, her grandchildren returned, and the chairs were already waiting.`,
    questions: [
      {
        text: "Where was the family house?",
        options: ["In the mountains", "Beside a clear lake", "In the city", "In a desert"],
        answer: 1,
      },
      {
        text: "Who arrived alone the last summer?",
        options: ["The grandfather", "The grandmother", "A child", "The father"],
        answer: 1,
      },
      {
        text: "Why did the grandmother talk to empty chairs?",
        options: [
          "She was talking to ghosts",
          "She was keeping the conversation warm until family returned",
          "She was practicing a speech",
          "She was cold",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Stamp Collector",
    text: `An old collector named Felix had a stamp from a country that no longer existed. He refused to sell it, though collectors offered fortunes. A young historian asked to see it, and Felix noticed tears in her eyes. "My grandmother was from there," she whispered. Felix gave her the stamp and asked only that she tell its story. Years later, the historian published a book about the lost nation, and the stamp adorned the cover. Felix bought a copy and kept it by his chair until he died.`,
    questions: [
      {
        text: "What did Felix collect?",
        options: ["Coins", "Stamps", "Books", "Maps"],
        answer: 1,
      },
      {
        text: "Why did the historian want to see the stamp?",
        options: [
          "She wanted to sell it",
          "Her grandmother was from the lost country",
          "She was writing about Felix",
          "She collected stamps too",
        ],
        answer: 1,
      },
      {
        text: "What did Felix ask in return for the stamp?",
        options: [
          "A fortune",
          "That she tell its story",
          "A book",
          "A copy of her research",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Rag Picker",
    text: `A rag picker named Bessie collected scraps of fabric others threw away. Each night, she sewed them into quilts for the homeless shelter. A rich woman mocked her for using garbage, so Bessie invited her to the shelter. That winter, the rich woman's own house burned down, and she slept beneath one of Bessie's quilts. She recognized a scrap of silk from a dress she had discarded years before. "You threw away a memory," Bessie said. "I just gave it warmth."`,
    questions: [
      {
        text: "What did Bessie collect?",
        options: ["Coins", "Fabric scraps", "Books", "Glass"],
        answer: 1,
      },
      {
        text: "What did she make from the scraps?",
        options: ["Dresses", "Quilts", "Curtains", "Rugs"],
        answer: 1,
      },
      {
        text: "What did the rich woman recognize in her quilt?",
        options: [
          "A scrap of silk from a dress she discarded",
          "Her initials",
          "A family photo",
          "Gold thread",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Kite Maker",
    text: `A kite maker named Soren built kites that could fly in no wind. Children laughed until their kites, made of cheap plastic, crashed while Soren's soared higher and higher. A lonely boy asked the secret, and Soren handed him a spool. "You must believe the sky wants you," he said. The boy flew his kite that afternoon, and it rose above the others. Years later, he became a pilot and kept Soren's first kite hanging in his office, a reminder that belief could create lift.`,
    questions: [
      {
        text: "What did Soren make?",
        options: ["Boats", "Kites", "Birds", "Balloons"],
        answer: 1,
      },
      {
        text: "What did Soren tell the boy was the secret?",
        options: [
          "Use strong string",
          "Believe the sky wants you",
          "Run very fast",
          "Fly at noon",
        ],
        answer: 1,
      },
      {
        text: "What did the boy become as an adult?",
        options: ["A sailor", "A pilot", "A teacher", "A farmer"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Hermit's Telescope",
    text: `A hermit named Cassius lived on a mountain with a telescope pointed at the sea. Villagers thought he was watching ships until a girl climbed up and looked through the lens. She saw not the ocean but the village below, tiny and bright. "I'm not watching who arrives," Cassius said. "I'm watching who leaves their light on for someone still coming home." The girl began leaving her lantern burning each night. One winter evening, her brother saw it from a distant ship and knew exactly where to sail.`,
    questions: [
      {
        text: "What did Cassius point at the sea?",
        options: ["A camera", "A telescope", "A mirror", "A lantern"],
        answer: 1,
      },
      {
        text: "What did the girl see through the telescope?",
        options: ["Ships", "The village below", "Stars", "Birds"],
        answer: 1,
      },
      {
        text: "Who saw the girl's lantern from a ship?",
        options: ["Her father", "Her brother", "A stranger", "Cassius"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Antique Typewriter",
    text: `A woman named Elsa bought an old typewriter at a yard sale. The first page she typed came out covered in words she had not written, a letter from a soldier to his wife decades ago. Each page she fed into the machine revealed another lost letter. Elsa began mailing them to descendants she tracked down. Some families wept, others finally understood old wounds. When the typewriter ran out of stories, Elsa sold it, hoping the next owner would continue the unfinished correspondence.`,
    questions: [
      {
        text: "What did Elsa buy?",
        options: ["A mirror", "An antique typewriter", "A book", "A clock"],
        answer: 1,
      },
      {
        text: "What appeared on the typed pages?",
        options: [
          "Elsa's own thoughts",
          "Letters from the past",
          "Blank pages",
          "Poems",
        ],
        answer: 1,
      },
      {
        text: "What did Elsa do with the letters?",
        options: [
          "Kept them secret",
          "Mailed them to descendants",
          "Burned them",
          "Sold them",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Copper Teapot",
    text: `A teapot in a small cafe never went cold. No matter how many cups were poured, the tea stayed warm. The owner, Mr. Chen, said the pot had belonged to his grandmother, who believed hospitality was a form of magic. Travelers came from distant cities just to sit with a warm cup. One snowy night, a stranded bus driver entered with twenty cold passengers. Mr. Chen poured cup after cup until dawn, and the teapot never emptied. By morning, everyone believed in at least one kind of magic.`,
    questions: [
      {
        text: "What was special about the teapot?",
        options: [
          "It was made of gold",
          "The tea never went cold",
          "It sang when poured",
          "It changed colors",
        ],
        answer: 1,
      },
      {
        text: "Who owned the cafe?",
        options: ["Mr. Chen", "Mrs. Finch", "Elsa", "Soren"],
        answer: 0,
      },
      {
        text: "Who arrived on the snowy night?",
        options: [
          "A single traveler",
          "A stranded bus driver with twenty passengers",
          "A wedding party",
          "A group of musicians",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Wishing Well",
    text: `A village well granted wishes, but only if the wisher threw in something they truly needed. A farmer threw his last coin and received rain. A student threw her only pencil and passed the exam. A greedy man threw a pebble, pretending it was precious, and received nothing. He complained for years until a child explained that the well could see what mattered, not what glittered. The man returned with his anger and dropped it in. The well gave him silence, and for the first time, he slept.`,
    questions: [
      {
        text: "What did the farmer throw into the well?",
        options: ["A seed", "His last coin", "A pebble", "A ring"],
        answer: 1,
      },
      {
        text: "Why did the greedy man receive nothing?",
        options: [
          "He threw a pebble pretending it was precious",
          "He asked for too much",
          "The well was dry",
          "He came at night",
        ],
        answer: 0,
      },
      {
        text: "What did the man drop in on his second visit?",
        options: ["Gold", "His anger", "A coin", "A stone"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Patchwork Quilt",
    text: `A grandmother named Mae stitched a quilt from fabric scraps donated by the whole town. Each square held a story: a wedding dress, a graduation gown, a soldier's uniform. When Mae grew ill, the townspeople finished the quilt together. They wrapped her in it on the night she died, and she smiled because she could feel every life she had touched. The quilt hung in the town hall afterward, and visitors often said it seemed warmer than the room around it.`,
    questions: [
      {
        text: "What did Mae make from fabric scraps?",
        options: ["A dress", "A quilt", "A curtain", "A rug"],
        answer: 1,
      },
      {
        text: "Who donated the fabric scraps?",
        options: ["The whole town", "Mae's family", "A single merchant", "Travelers"],
        answer: 0,
      },
      {
        text: "Where did the finished quilt hang?",
        options: ["In Mae's house", "In the town hall", "In a museum", "In a church"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Ice Cream Cart",
    text: `An ice cream seller named Joe gave free cones to anyone who could make him laugh. Business was slow, but his cart was always surrounded by children telling jokes. One summer, a mute girl drew him a cartoon that made him laugh so hard he gave her two scoops for life. She grew up to be an illustrator, and her first book was about a laughing ice cream man. Joe kept a signed copy in his cart and read it to every child who asked for a free cone.`,
    questions: [
      {
        text: "What did Joe give to people who made him laugh?",
        options: ["Money", "Free ice cream", "Toys", "Books"],
        answer: 1,
      },
      {
        text: "How did the mute girl make Joe laugh?",
        options: ["She told a joke", "She drew a cartoon", "She sang", "She danced"],
        answer: 1,
      },
      {
        text: "What profession did the girl have as an adult?",
        options: ["A doctor", "An illustrator", "A teacher", "A chef"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Old Cinema",
    text: `A cinema on Main Street showed only one film, a love story from fifty years ago. The owner, Mrs. Dell, insisted it was the only movie worth watching. Young people mocked her until a couple, separated by war, reunited in her theater during the final scene. They had each seen the film alone for decades, believing the other was lost. After that, tickets sold out every night. Mrs. Dell never changed the film. Some stories, she said, simply need the right audience to become true.`,
    questions: [
      {
        text: "How many films did the cinema show?",
        options: ["Many", "One", "None", "Two"],
        answer: 1,
      },
      {
        text: "Who reunited during the final scene?",
        options: [
          "Two actors",
          "A couple separated by war",
          "Mrs. Dell and her husband",
          "Siblings",
        ],
        answer: 1,
      },
      {
        text: "Why did tickets sell out after that night?",
        options: [
          "The film won an award",
          "People believed the story could come true for them",
          "The theater was renovated",
          "A celebrity visited",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Scent Maker",
    text: `A perfumer named Odette created fragrances that smelled like forgotten moments: first rain, old libraries, a grandmother's kitchen. Customers wept without knowing why. One day, a man asked for a scent that smelled like courage. Odette blended cedar, salt, and smoke. He wore it when he confessed a mistake to his brother, and the brothers reconciled after twenty years. Odette kept a small bottle labeled "Forgiveness" on her highest shelf, reserved for those who were ready to begin again.`,
    questions: [
      {
        text: "What did Odette create?",
        options: ["Food", "Perfumes", "Paintings", "Music"],
        answer: 1,
      },
      {
        text: "What scent did the man request?",
        options: ["Love", "Courage", "Joy", "Memory"],
        answer: 1,
      },
      {
        text: "What did Odette label her highest-shelf bottle?",
        options: ["Courage", "Forgiveness", "Memory", "Rain"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Toy Repair Shop",
    text: `A toymaker named Abel fixed broken dolls and trains in a shop that smelled of glue and cedar. Children brought him treasures with missing eyes and cracked wheels. Abel never charged; instead, he asked each child to tell him the toy's name. "A thing with a name deserves to be whole," he said. One winter, a fire damaged his shop, and the whole town arrived with tools and wood. They rebuilt it in three days, because every family had something Abel had once saved.`,
    questions: [
      {
        text: "What did Abel repair?",
        options: ["Shoes", "Toys", "Watches", "Furniture"],
        answer: 1,
      },
      {
        text: "What did Abel ask children instead of payment?",
        options: [
          "Their toy's name",
          "A coin",
          "A drawing",
          "A promise",
        ],
        answer: 0,
      },
      {
        text: "Why did the town rebuild Abel's shop so quickly?",
        options: [
          "He paid them well",
          "Every family had something he had saved",
          "The mayor ordered it",
          "It was the only shop in town",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Bicycle Messenger",
    text: `In a city of instant messages, a bicycle messenger named Jules delivered handwritten letters. People teased him for being slow until a blackout shut down every screen. Jules pedaled through dark streets carrying news of births, apologies, and love. One elderly woman received a letter from her sister overseas after forty years of silence. She pressed it to her heart and said some things were worth waiting for, no matter how long the ride. Jules kept delivering letters even after the power returned.`,
    questions: [
      {
        text: "What did Jules deliver?",
        options: ["Packages", "Handwritten letters", "Food", "Medicine"],
        answer: 1,
      },
      {
        text: "When did Jules become essential?",
        options: ["During a festival", "During a blackout", "During a storm", "During a war"],
        answer: 1,
      },
      {
        text: "Who received a letter from her sister after forty years?",
        options: ["A young girl", "An elderly woman", "Jules himself", "A soldier"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Weather Clock",
    text: `A clockmaker built a clock that predicted the weather instead of telling time. Sunny hours meant clear skies, and chiming bells announced storms. People stopped using ordinary forecasts and planned their lives around the clock. One day, the clock stopped during a drought. The town panicked until a farmer named Dell realized the clock had not broken; it was waiting for them to plant trees and change the weather themselves. They planted an orchard, and when the rains finally came, the clock began to tick again.`,
    questions: [
      {
        text: "What did the special clock predict?",
        options: ["The future", "The weather", "Earthquakes", "Harvests"],
        answer: 1,
      },
      {
        text: "When did the clock stop?",
        options: ["During a flood", "During a drought", "During winter", "At midnight"],
        answer: 1,
      },
      {
        text: "What did the town do to make the clock tick again?",
        options: [
          "They planted an orchard",
          "They replaced the battery",
          "They prayed for rain",
          "They sold the clock",
        ],
        answer: 0,
      },
    ],
  },
  {
    title: "The Seed Library",
    text: `A librarian named Rosa ran a seed library where people borrowed plant seeds and returned new ones after harvest. Skeptics said no one would bring seeds back, but Rosa trusted her neighbors. Within three years, the town grew rare tomatoes, beans, and flowers that had nearly disappeared. A seed company offered to buy her collection, but Rosa refused. "These seeds belong to the future," she said, "and the future doesn't take checks." Children now visit her library to check out sunflowers like other libraries lend books.`,
    questions: [
      {
        text: "What did Rosa's library lend?",
        options: ["Books", "Seeds", "Tools", "Money"],
        answer: 1,
      },
      {
        text: "What did a seed company want to do?",
        options: [
          "Buy her collection",
          "Burn the seeds",
          "Build a new library",
          "Hire Rosa",
        ],
        answer: 0,
      },
      {
        text: "What do children check out like books?",
        options: ["Tomatoes", "Sunflowers", "Beans", "Flowers"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Match Seller",
    text: `An old woman sold matches on a cold street corner. Passersby bought them out of pity, though they had lighters at home. On New Year's Eve, a young writer bought the entire box and invited her to warm up in a cafe. She told him stories of every city she had lived in, each one ending with a small fire she had lit to keep someone warm. The writer published a book about her, and royalties built her a cottage with a fireplace she never let go out.`,
    questions: [
      {
        text: "What did the old woman sell?",
        options: ["Flowers", "Matches", "Bread", "Newspapers"],
        answer: 1,
      },
      {
        text: "When did the writer buy the entire box?",
        options: ["On Christmas", "On New Year's Eve", "On her birthday", "On a rainy day"],
        answer: 1,
      },
      {
        text: "What did the royalties from the book build for her?",
        options: ["A shop", "A cottage", "A library", "A boat"],
        answer: 1,
      },
    ],
  },
  {
    title: "The Music Box Dancer",
    text: `A music box in a thrift store played a tune no one recognized. A dancer named Lila bought it and found that whenever she wound it, her feet moved in steps she had never learned. She followed the melody onto a stage and performed a dance that made the audience weep. An old woman in the crowd recognized the tune as one her late husband had composed for their wedding. Lila returned the music box to her, and the woman danced alone in her kitchen that evening, young again for three minutes.`,
    questions: [
      {
        text: "What did Lila buy at the thrift store?",
        options: ["A dress", "A music box", "A mirror", "A painting"],
        answer: 1,
      },
      {
        text: "What happened when Lila wound the music box?",
        options: [
          "It broke",
          "Her feet moved in unknown steps",
          "It played loudly",
          "It opened a door",
        ],
        answer: 1,
      },
      {
        text: "Who recognized the tune?",
        options: [
          "A young man",
          "An old woman whose husband composed it",
          "Lila's mother",
          "The shop owner",
        ],
        answer: 1,
      },
    ],
  },
  {
    title: "The Final Passenger",
    text: `A bus driver named Sam always waited one extra minute at the last stop, just in case. Other drivers mocked him for delaying the route. One rainy night, a woman in a wedding dress ran toward the bus, and Sam held the door. She had escaped a marriage she did not want, and his minute gave her the courage to leave. She became a lawyer who helped others find their way out. Years later, she waited at that same stop and told Sam his patience had saved her life.`,
    questions: [
      {
        text: "What did Sam always do at the last stop?",
        options: [
          "Speed away",
          "Wait one extra minute",
          "Honk the horn",
          "Close the doors quickly",
        ],
        answer: 1,
      },
      {
        text: "Who ran toward the bus in the rain?",
        options: [
          "A man in a suit",
          "A woman in a wedding dress",
          "A child",
          "An old man",
        ],
        answer: 1,
      },
      {
        text: "What profession did the woman eventually have?",
        options: ["A doctor", "A lawyer", "A teacher", "A driver"],
        answer: 1,
      },
    ],
  },
]

function shuffle(array) {
  const next = array.slice()
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function AttentionIsAllYouNeed() {
  const [phase, setPhase] = useState('idle') // idle | reading | question | feedback | finished
  const [story, setStory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selected, setSelected] = useState(null)
  const [wasCorrect, setWasCorrect] = useState(null)
  const [best, setBest] = useState(() => getBest('attention-is-all-you-need'))
  const [isRecord, setIsRecord] = useState(false)

  const startGame = useCallback(() => {
    const s = STORIES[Math.floor(Math.random() * STORIES.length)]
    const qs = shuffle(s.questions).slice(0, QUESTIONS_PER_STORY)
    setStory(s)
    setQuestions(qs)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setWasCorrect(null)
    setIsRecord(false)
    setTimeLeft(READING_TIME_MS)
    setPhase('reading')
  }, [])

  const advance = useCallback(() => {
    setSelected(null)
    setWasCorrect(null)
    if (index + 1 >= questions.length) {
      const finalScore = score + (wasCorrect ? 1 : 0)
      const record = saveBest('attention-is-all-you-need', null, finalScore)
      setIsRecord(record)
      setBest(getBest('attention-is-all-you-need'))
      setScore(finalScore)
      setPhase('finished')
    } else {
      if (wasCorrect) setScore((s) => s + 1)
      setIndex((i) => i + 1)
      setPhase('question')
    }
  }, [index, questions.length, score, wasCorrect])

  useEffect(() => {
    if (phase !== 'reading') return
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = READING_TIME_MS - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(id)
        setTimeLeft(0)
        setPhase('question')
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(advance, 1200)
    return () => clearTimeout(id)
  }, [phase, advance])

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (phase !== 'question') return
      const correct = optionIndex === questions[index].answer
      setSelected(optionIndex)
      setWasCorrect(correct)
      setPhase('feedback')
    },
    [phase, questions, index],
  )

  const progress = timeLeft / READING_TIME_MS
  const current = questions[index]

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__stat">
          Q {Math.min(index + 1, questions.length) || 0}/{questions.length || QUESTIONS_PER_STORY}
        </span>
        <span className="game__stat">Score {score}</span>
        {best !== null && (
          <span className="game__stat game__stat--best">
            Best {formatBest('attention-is-all-you-need', best)}
          </span>
        )}
      </header>

      <div className="game__stage">
        {phase === 'idle' && (
          <div className="panel">
            <h1 className="panel__title">Attention Is All You Need</h1>
            <p className="panel__text">
              Read a short story in {READING_TIME_MS / 1000} seconds, then answer multiple-choice
              questions from memory. Three questions per story. How well can you pay attention?
            </p>
            <button className="btn btn--primary" onClick={startGame}>
              Start
            </button>
          </div>
        )}

        {phase === 'reading' && story && (
          <div className="panel panel--wide">
            <p className="panel__label">Read carefully</p>
            <h2 className="attention__title">{story.title}</h2>
            <p className="attention__story">{story.text}</p>
            <div className="timer">
              <div
                className={`timer__bar ${progress <= 0.25 ? 'timer__bar--urgent' : ''}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="timer__text">{Math.ceil(timeLeft / 1000)}s</p>
          </div>
        )}

        {(phase === 'question' || phase === 'feedback') && current && (
          <div className="panel panel--wide">
            <p className="panel__label">Question {index + 1}</p>
            <p className="attention__question">{current.text}</p>

            <div className="options options--stack">
              {current.options.map((opt, i) => {
                const isSelected = selected === i
                const isAnswer = i === current.answer
                let btnClass = 'option option--text'
                if (phase === 'feedback') {
                  if (isAnswer) btnClass += ' option--correct'
                  else if (isSelected) btnClass += ' option--wrong'
                  else btnClass += ' option--faded'
                }
                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={() => handleAnswer(i)}
                    disabled={phase === 'feedback'}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {phase === 'feedback' && (
              <div className={`badge ${wasCorrect ? 'badge--ok' : 'badge--bad'}`}>
                {wasCorrect ? 'Correct!' : 'Wrong'}
              </div>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div className="panel">
            <div className="badge badge--ok">Finished!</div>
            <p className="panel__text">
              You scored <strong>{score}/{questions.length}</strong>
            </p>
            {isRecord && <div className="badge badge--record">New Best!</div>}
            {best !== null && !isRecord && (
              <p className="panel__text panel__text--muted">
                Best: {formatBest('attention-is-all-you-need', best)}
              </p>
            )}
            <button className="btn btn--primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
