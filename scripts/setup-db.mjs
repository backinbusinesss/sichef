import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(path.join(root, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
        if (!match) continue;
        const [, key, raw] = match;
        if (!process.env[key]) process.env[key] = raw.replace(/^["']|["']$/g, "");
      }
    } catch {
      /* file opzionale */
    }
  }
}

loadEnv();

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  console.error("DATABASE_URL mancante. Esegui: vercel env pull .env.local");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(path.join(root, "db", "schema.sql"), "utf8");

console.log("→ Applico lo schema…");
const clean = schema
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const statements = clean
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(`${statement};`);
}
console.log(`✓ Schema pronto (${statements.length} comandi)`);

// ---------------------------------------------------------------- admin
const email = process.env.ADMIN_EMAIL || "admin@ristorantesichef.com";
const password = process.env.ADMIN_PASSWORD || "SiChef2026!";
const hash = await bcrypt.hash(password, 12);

await sql`
  insert into admin_users (email, password_hash, name)
  values (${email.toLowerCase()}, ${hash}, 'Si Chef')
  on conflict (email) do update set password_hash = excluded.password_hash, name = excluded.name
`;
console.log(`✓ Admin: ${email}`);

// ---------------------------------------------------------------- categorie
const categories = [
  { slug: "antipasti", name: "Antipasti", tagline: "Per cominciare con gusto", description: "Il mare, la terra e il gnocco fritto: il modo più bello per aprire la serata.", kind: "food", emoji: "🥂", order: 1 },
  { slug: "primi", name: "Primi piatti", tagline: "La pasta, fatta come si deve", description: "Ricette di casa, materie prime scelte e porzioni generose. Come si fa da sempre.", kind: "food", emoji: "🍝", order: 2 },
  { slug: "risotti", name: "Risotti", tagline: "Minimo due persone", description: "Mantecati al momento, da condividere. Il risotto è un rito, non un contorno.", kind: "food", emoji: "🍚", order: 3 },
  { slug: "secondi-carne", name: "Secondi di carne", tagline: "La griglia e la tradizione", description: "Tagli selezionati, cotture semplici e il profumo della brace.", kind: "food", emoji: "🥩", order: 4 },
  { slug: "secondi-pesce", name: "Secondi di pesce", tagline: "Dal mare, ogni giorno", description: "Pesce fresco, fritti croccanti e grigliate da condividere.", kind: "food", emoji: "🐟", order: 5 },
  { slug: "insalate", name: "Insalate", tagline: "Fresche e generose", description: "Un piatto unico o un contorno importante, sempre preparato al momento.", kind: "food", emoji: "🥗", order: 6 },
  { slug: "contorni", name: "Contorni", tagline: "Il giusto accompagnamento", description: "Patatine, verdure e contorni della casa.", kind: "food", emoji: "🥔", order: 7 },
  { slug: "pizze-classiche", name: "Pizze classiche", tagline: "L'impasto della casa", description: "La pizza di Si Chef: cornicione alto, ingredienti semplici e cottura al punto.", kind: "food", emoji: "🍕", order: 8 },
  { slug: "pizze-bianche", name: "Pizze bianche", tagline: "Senza pomodoro, con carattere", description: "Mozzarella, formaggi e abbinamenti che non hanno bisogno del rosso.", kind: "food", emoji: "🧀", order: 9 },
  { slug: "pizze-speciali", name: "Pizze speciali", tagline: "Le firme di Si Chef", description: "Le nostre combinazioni più amate, dal mare alla montagna.", kind: "food", emoji: "🌟", order: 10 },
  { slug: "pizze-baby", name: "Pizze baby", tagline: "Per i più piccoli", description: "Piccole di formato, grandi di soddisfazione.", kind: "food", emoji: "🧒", order: 11 },
  { slug: "menu-fissi", name: "Menu fissi & pranzo", tagline: "La formula giusta", description: "Pranzo completo, pizza e bibita, menu di terra e di mare: pensati per stare bene senza pensieri.", kind: "food", emoji: "📋", order: 12 },
  { slug: "dolci", name: "Dessert", tagline: "Il finale che merita", description: "Dolci della casa, gelato e le coppe che fanno tornare bambini.", kind: "food", emoji: "🍰", order: 13 },
  { slug: "bevande", name: "Bevande", tagline: "Acqua, bibite, caffè", description: "Tutto quello che serve, servito fresco.", kind: "drink", emoji: "🥤", order: 14 },
  { slug: "birre", name: "Birre", tagline: "Alla spina e in bottiglia", description: "Pils, weiss e rosse: la scelta giusta per pizza e grigliate.", kind: "drink", emoji: "🍺", order: 15 },
  { slug: "vini", name: "Vini & bollicine", tagline: "La cantina", description: "Il vino della casa, bollicine per brindare e etichette per ogni piatto.", kind: "drink", emoji: "🍷", order: 16 },
  { slug: "liquori", name: "Liquori", tagline: "Per chiudere in bellezza", description: "Amari, grappe, whisky e cognac. Il modo giusto per finire la serata.", kind: "drink", emoji: "🥃", order: 17 },
];

for (const c of categories) {
  await sql`
    insert into categories (slug, name, tagline, description, kind, emoji, sort_order, is_active)
    values (${c.slug}, ${c.name}, ${c.tagline}, ${c.description}, ${c.kind}, ${c.emoji}, ${c.order}, true)
    on conflict (slug) do update set
      name = excluded.name, tagline = excluded.tagline, description = excluded.description,
      kind = excluded.kind, emoji = excluded.emoji, sort_order = excluded.sort_order,
      is_active = true, updated_at = now()
  `;
}
console.log(`✓ ${categories.length} categorie`);

// ---------------------------------------------------------------- menu
const menu = {
  antipasti: [
    { name: "Antipasto del marinaio", description: "Selezione di mare del giorno: salmone, pesce spada, alici marinaste, gamberi e capesante, con citronette agli agrumi.", price: 18.5, allergens: ["fish", "crustaceans", "molluscs", "sulphites"], featured: true, image: "/assets/img/dish-antipasto.webp" },
    { name: "Tris di pesce affumicato", description: "Salmone, pesce spada e tonno affumicati, serviti con glassa all'aceto balsamico.", price: 15.0, allergens: ["fish", "sulphites"] },
    { name: "Affettato misto con gnocco fritto", description: "Salumi misti della casa, gnocco fritto caldo e sottaceti. Da dividere, se ci riuscite.", price: 13.5, allergens: ["gluten", "milk", "sulphites"] },
    { name: "Antipasto di terra Si Chef", description: "Affettati misti, formaggi, cipolle borettane, gnocco fritto, peperoncini ripieni al tonno e olive ascolane.", price: 15.5, allergens: ["gluten", "milk", "fish", "sulphites"], featured: true, image: "/assets/img/dish-antipasto.webp" },
    { name: "Insalatina di rucola, fragole e gamberetti", description: "Rucola, fragole, ananas e gamberetti, con salsa delicata alla fragola.", price: 12.0, allergens: ["crustaceans", "sulphites"] },
    { name: "Tris di pesce marinato", description: "Salmone, alici e pesce spada marinati agli agrumi, con olio extravergine e erbe fresche.", price: 17.0, allergens: ["fish", "sulphites"] },
    { name: "Capesante e cozze gratinate al forno", description: "Capesante e cozze gratinate con pane alle erbe e olio extravergine.", price: 18.0, allergens: ["molluscs", "gluten", "milk"] },
    { name: "Spadellata di calamari e gamberi", description: "Calamari e gamberi sfumati al vino bianco, serviti con crostini caldi.", price: 16.5, allergens: ["molluscs", "crustaceans", "gluten", "sulphites"] },
  ],
  primi: [
    { name: "Spaghetti ai frutti di mare", description: "Spaghetti, frutti di mare, pomodorini e prezzemolo fresco. Il profumo del mare in un piatto.", price: 15.0, allergens: ["gluten", "crustaceans", "molluscs", "fish"], featured: true, image: "/assets/img/seafood.webp" },
    { name: "Linguine alle vongole veraci", description: "Vongole veraci, aglio, olio extravergine e prezzemolo.", price: 15.0, allergens: ["gluten", "molluscs", "fish"] },
    { name: "Tagliatelle porcini, gamberi e guanciale", description: "Tagliatelle fresche con porcini, gamberi e guanciale croccante, con pomodorini.", price: 14.0, allergens: ["gluten", "eggs", "crustaceans", "milk"] },
    { name: "Calamarata al ragù bianco di cinghiale", description: "Calamarata con ragù bianco di cinghiale, cotto lentamente con erbe aromatiche.", price: 15.0, allergens: ["gluten", "milk", "celery", "sulphites"] },
    { name: "Orecchiette burrata e pistacchio", description: "Orecchiette fresche con pomodoro, burrata, crema di pistacchio e granella croccante.", price: 14.0, allergens: ["gluten", "milk", "nuts"], vegetarian: true },
    { name: "Gnocchetti zola e nocciole", description: "Gnocchetti freschi sulla fonduta di zola, con granella di nocciole tostate.", price: 12.0, allergens: ["gluten", "milk", "nuts"], vegetarian: true },
    { name: "Pacchetti ai crostacei e pomodorini", description: "Pacchetti delicati con crostacei, basilico e pomodorini datterino.", price: 18.0, allergens: ["gluten", "crustaceans", "fish", "eggs"] },
    { name: "Scrigni agli scampi", description: "Pasta ripiena agli scampi, con colata di burro e coriandoli di salvia.", price: 14.5, allergens: ["gluten", "crustaceans", "milk", "fish"] },
    { name: "Bauletti porcini e taleggio", description: "Pasta ripiena con porcini e taleggio, mantecata con parmigiano e burro.", price: 14.5, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Maccheroncini alla Vecchia Cerro", description: "La nostra pasta della tradizione: maccheroncini al ragù, come li faceva la nonna.", price: 12.0, allergens: ["gluten", "milk", "celery", "sulphites"], featured: true, image: "/assets/img/pasta.webp" },
  ],
  risotti: [
    { name: "Risotto zucchine, capesante e seppia", description: "Risotto con zucchine, capesante e seppia, con crumble di pane e pinoli. Minimo due persone.", price: 13.5, allergens: ["crustaceans", "molluscs", "gluten", "nuts", "fish"] },
    { name: "Risotto porcini e Castelmagno", description: "Risotto mantecato con porcini e Castelmagno. Minimo due persone.", price: 13.0, allergens: ["milk", "sulphites"], vegetarian: true, featured: true, image: "/assets/img/risotto.webp" },
    { name: "Risotto gamberi e stracciatella", description: "Risotto con julienne di verdure, code di gamberi e stracciatella di bufala. Minimo due persone.", price: 15.0, allergens: ["crustaceans", "milk"] },
  ],
  "secondi-carne": [
    { name: "Cotoletta alla Milanese", description: "Cotoletta di vitello panata e fritta, con osso. La tradizione milanese, senza scorciatoie.", price: 14.0, allergens: ["gluten", "eggs", "milk"], featured: true, image: "/assets/img/table.webp" },
    { name: "Carpaccio di carne salada", description: "Carne salada con rucola e scaglie di grana.", price: 14.0, allergens: ["milk"] },
    { name: "Grigliata di carne", description: "Selezione di carni alla griglia, servita con contorno della casa.", price: 18.0, allergens: ["sulphites"], featured: true, image: "/assets/img/dish-grigliata.webp" },
    { name: "Costata di Scottona alla griglia", description: "Costata di scottona alla griglia, con sale grosso e rosmarino.", price: 20.0, allergens: ["sulphites"] },
    { name: "Tagliata di filetto con rucola e grana", description: "Filetto di manzo alla griglia, rucola e scaglie di grana.", price: 20.0, allergens: ["milk", "sulphites"] },
    { name: "Filetto di manzo alla griglia", description: "Filetto di manzo, cottura al punto desiderato.", price: 20.0, allergens: ["sulphites"] },
    { name: "Arrosto ai funghi porcini", description: "Arrosto di carne con funghi porcini e patate.", price: 13.5, allergens: ["milk", "celery", "sulphites"] },
    { name: "Grigliata mista di carne", description: "Grigliata mista con salsiccia, costine e tagli della casa.", price: 15.5, allergens: ["sulphites"] },
  ],
  "secondi-pesce": [
    { name: "Super grigliata di pesce", description: "Gamberoni, scampi, calamari, filetto di branzino e verdure. La grigliata da condividere.", price: 20.0, allergens: ["fish", "crustaceans", "molluscs"], featured: true, image: "/assets/img/dish-grigliata.webp" },
    { name: "Gran fritto misto imperiale", description: "Calamari, totani, seppie, gamberi, ciuffi e gamberone, fritti al momento.", price: 17.5, allergens: ["fish", "crustaceans", "molluscs", "gluten", "eggs"], featured: true, image: "/assets/img/dish-fritto.webp" },
    { name: "Fritto di calamari", description: "Calamari freschi in pastella leggera, fritti al momento.", price: 15.0, allergens: ["molluscs", "gluten", "eggs"] },
    { name: "Branzino gratinato alle mandorle", description: "Filetto di branzino gratinato al forno con mandorle.", price: 16.0, allergens: ["fish", "nuts", "milk"] },
    { name: "Gamberoni al guanciale e brandy", description: "Gamberoni argentini avvolti nel guanciale e spadellati al brandy.", price: 18.0, allergens: ["crustaceans", "sulphites"] },
    { name: "Pesce spada alla griglia", description: "Pesce spada fresco alla griglia, con limone e olio extravergine.", price: 16.0, allergens: ["fish"] },
    { name: "Spiedini di gamberi e calamari", description: "Spiedini di gamberi e calamari gratinati al forno.", price: 17.5, allergens: ["crustaceans", "molluscs", "gluten", "milk"] },
    { name: "Zuppetta di cozze e vongole", description: "Cozze e vongole in guazzetto di pomodoro, aglio e prezzemolo.", price: 12.0, allergens: ["molluscs", "fish", "gluten", "sulphites"] },
  ],
  insalate: [
    { name: "Caesar Salad", description: "Insalata mista, cubetti di pollo alla griglia, grana a scaglie, crostini e salsa Caesar.", price: 10.0, allergens: ["gluten", "milk", "eggs", "fish", "mustard"] },
    { name: "Insalata del pescatore", description: "Insalata mista, tonno, gamberetti, olive nere, mais e mozzarella.", price: 10.0, allergens: ["fish", "crustaceans", "milk", "sulphites"] },
    { name: "Insalatina di soncino, gamberi e noci", description: "Soncino, gamberi, scaglie di grana e noci.", price: 9.5, allergens: ["crustaceans", "milk", "nuts"] },
    { name: "Insalata mista", description: "Insalata fresca di stagione.", price: 4.0, allergens: [], vegetarian: true, vegan: true, glutenFree: true },
  ],
  contorni: [
    { name: "Patatine fritte dippers", description: "Patatine fritte croccanti.", price: 5.0, allergens: [], vegetarian: true, glutenFree: true },
    { name: "Verdure alla griglia", description: "Verdure di stagione alla griglia, olio extravergine e erbe.", price: 5.0, allergens: [], vegetarian: true, vegan: true, glutenFree: true },
    { name: "Crocchette di patate", description: "Crocchette di patate fritte.", price: 5.0, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Spinaci al burro", description: "Spinaci saltati al burro.", price: 5.0, allergens: ["milk"], vegetarian: true, glutenFree: true },
    { name: "Insalata mista", description: "Insalata fresca di stagione.", price: 4.0, allergens: [], vegetarian: true, vegan: true, glutenFree: true },
  ],
  "pizze-classiche": [
    { name: "Margherita", description: "Pomodoro e mozzarella.", price: 6.5, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Quattro stagioni", description: "Pomodoro, mozzarella, prosciutto cotto, carciofi, funghi e olive.", price: 8.5, allergens: ["gluten", "milk"] },
    { name: "Capricciosa", description: "Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi, acciughe e olive nere.", price: 9.0, allergens: ["gluten", "milk", "fish"] },
    { name: "Napoli", description: "Pomodoro, mozzarella e acciughe.", price: 8.5, allergens: ["gluten", "milk", "fish"] },
    { name: "Quattro formaggi", description: "Pomodoro, mozzarella e formaggi misti.", price: 9.0, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Verdure e grana", description: "Pomodoro, mozzarella, melanzane, zucchine, peperoni e grana.", price: 10.0, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Tonno e cipolla", description: "Pomodoro, mozzarella, tonno e cipolla.", price: 10.0, allergens: ["gluten", "milk", "fish"] },
    { name: "Prosciutto", description: "Pomodoro, mozzarella e prosciutto cotto.", price: 8.0, allergens: ["gluten", "milk"] },
    { name: "Prosciutto e funghi", description: "Pomodoro, mozzarella, prosciutto cotto e funghi.", price: 8.5, allergens: ["gluten", "milk"] },
    { name: "Diavola", description: "Pomodoro, mozzarella e salame piccante.", price: 8.5, allergens: ["gluten", "milk"], spicy: true },
    { name: "Marinara", description: "Doppio pomodoro, origano e aglio.", price: 5.5, allergens: ["gluten"], vegan: true, vegetarian: true },
    { name: "Americana", description: "Pomodoro, mozzarella e patatine.", price: 8.0, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Tedesca", description: "Pomodoro, mozzarella e wurstel.", price: 8.0, allergens: ["gluten", "milk"] },
    { name: "Salsiccia", description: "Pomodoro, mozzarella e salsiccia.", price: 8.5, allergens: ["gluten", "milk"] },
    { name: "Calzone liscio", description: "Pomodoro, mozzarella e prosciutto cotto.", price: 9.0, allergens: ["gluten", "milk"] },
    { name: "Calzone farcito", description: "Pomodoro, mozzarella, prosciutto cotto, carciofi e funghi.", price: 10.0, allergens: ["gluten", "milk"] },
  ],
  "pizze-bianche": [
    { name: "Carbonara", description: "Mozzarella, guanciale, grana grattugiato, pecorino romano, uovo e pepe.", price: 11.0, allergens: ["gluten", "milk", "eggs"] },
    { name: "Bufalina", description: "Mozzarella di bufala, speck e basilico.", price: 10.0, allergens: ["gluten", "milk"], featured: true, image: "/assets/img/hero.webp" },
    { name: "Delicata", description: "Mozzarella, zucchine, gamberetti e grana.", price: 11.0, allergens: ["gluten", "milk", "crustaceans"] },
    { name: "Norvegese", description: "Mozzarella, Philadelphia, gamberi, pesto di rucola e salmone affumicato.", price: 14.0, allergens: ["gluten", "milk", "fish", "crustaceans", "nuts"] },
    { name: "Tirolese", description: "Mozzarella, speck, brie e noci.", price: 11.5, allergens: ["gluten", "milk", "nuts"] },
    { name: "Marco", description: "Mozzarella, quattro formaggi, salame piccante e salsiccia.", price: 11.5, allergens: ["gluten", "milk"] },
    { name: "Salsiccia e friarielli", description: "Mozzarella, salsiccia e friarielli.", price: 10.5, allergens: ["gluten", "milk"] },
    { name: "Cacio e pepe", description: "Mozzarella, crema di cacio e pepe, guanciale e cipolle.", price: 13.0, allergens: ["gluten", "milk"] },
    { name: "Crocchè", description: "Mozzarella, crocchette, pancetta coppata e pomodori semisecchi.", price: 13.0, allergens: ["gluten", "milk", "eggs"] },
    { name: "Seba", description: "Mozzarella, crema di zafferano, scamorza, pancetta e bufala.", price: 13.0, allergens: ["gluten", "milk"] },
    { name: "Profumi di bosco", description: "Mozzarella, panna, scamorza affumicata, funghi porcini e speck.", price: 14.0, allergens: ["gluten", "milk"] },
    { name: "Salvo", description: "Mozzarella, crema di pistacchi, mortadella e burrata.", price: 13.0, allergens: ["gluten", "milk", "nuts"] },
    { name: "Pinuccio", description: "Crema di datterini gialli, mozzarella, zola e coppa.", price: 13.0, allergens: ["gluten", "milk"] },
  ],
  "pizze-speciali": [
    { name: "Mare e monti", description: "Pomodoro, mozzarella, gamberi e porcini.", price: 11.0, allergens: ["gluten", "milk", "crustaceans"] },
    { name: "Conchiglia", description: "Pomodoro, mozzarella, calamari fritti, gamberi e cozze.", price: 11.5, allergens: ["gluten", "milk", "crustaceans", "molluscs"] },
    { name: "Gemelle", description: "Pomodoro, mozzarella, bufala, pomodorini, basilico, tonno e gamberi.", price: 11.0, allergens: ["gluten", "milk", "fish", "crustaceans"] },
    { name: "Maria", description: "Pomodoro, mozzarella, tonno, pomodorini e rucola.", price: 11.0, allergens: ["gluten", "milk", "fish"] },
    { name: "Chiara", description: "Pomodoro, mozzarella, Philadelphia, speck e noci.", price: 11.0, allergens: ["gluten", "milk", "nuts"] },
    { name: "Sandy", description: "Pomodoro, mozzarella, cipolle, zola, prosciutto crudo e grana a scaglie.", price: 11.0, allergens: ["gluten", "milk"] },
    { name: "Martina", description: "Pomodoro, mozzarella, wurstel e patatine.", price: 10.0, allergens: ["gluten", "milk"] },
    { name: "Melissa", description: "Pomodoro, mozzarella, zucchine, gamberetti e calamari.", price: 11.5, allergens: ["gluten", "milk", "crustaceans", "molluscs"] },
    { name: "Si Chef", description: "Pomodoro, mozzarella, prosciutto crudo, bufala, radicchio, pomodorini e basilico. La pizza che porta il nostro nome.", price: 11.5, allergens: ["gluten", "milk"], featured: true, image: "/assets/img/dish-pizza.webp" },
    { name: "Thai (vegana)", description: "Doppio pomodoro, radicchio, cipolle, melanzane, zucchine, peperoni e funghi champignon. Senza mozzarella.", price: 11.5, allergens: ["gluten"], vegan: true, vegetarian: true },
    { name: "Rustica", description: "Pomodoro, mozzarella, melanzane, zucchine, pancetta e grana.", price: 11.5, allergens: ["gluten", "milk"] },
    { name: "Pizza fritto misto", description: "Pomodoro, mozzarella, calamari, gamberi fritti e ciuffetti.", price: 11.5, allergens: ["gluten", "milk", "fish", "crustaceans", "molluscs"] },
    { name: "Sfiziosa", description: "Pomodoro, mozzarella, bresaola, grana a scaglie e rucola.", price: 11.0, allergens: ["gluten", "milk"] },
    { name: "Inferno", description: "Pomodoro, mozzarella, salame piccante, 'nduja, pecorino e peperoncino.", price: 11.0, allergens: ["gluten", "milk"], spicy: true },
    { name: "Saporita", description: "Pomodoro, mozzarella, salsiccia, patate lesse e scamorza affumicata.", price: 11.0, allergens: ["gluten", "milk"] },
    { name: "Tentazione", description: "Pomodoro, mozzarella, Philadelphia, rucola e prosciutto crudo.", price: 11.5, allergens: ["gluten", "milk"] },
    { name: "Campagnola", description: "Pomodoro, mozzarella, salsiccia, porcini, peperoni e zola.", price: 11.5, allergens: ["gluten", "milk"] },
    { name: "Trentina (Gourmet)", description: "Pomodoro, mozzarella, carne salada, rucola, scaglie di grana e olio EVO.", price: 13.0, allergens: ["gluten", "milk"] },
    { name: "Divina (Gourmet)", description: "Pomodoro, mozzarella, crema 'nduja, lardo di Patanegra e cipolle di Tropea.", price: 13.0, allergens: ["gluten", "milk", "sulphites"], spicy: true },
    { name: "Deliziosa (Gourmet)", description: "Pomodoro, mozzarella, prosciutto crudo, squaquerone e pesto di rucola.", price: 11.0, allergens: ["gluten", "milk", "nuts"] },
  ],
  "pizze-baby": [
    { name: "Lele", description: "Pomodoro e mozzarella.", price: 5.5, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Chri", description: "Pomodoro, mozzarella e patatine.", price: 6.0, allergens: ["gluten", "milk"], vegetarian: true },
    { name: "Dani", description: "Pomodoro, mozzarella e prosciutto.", price: 6.5, allergens: ["gluten", "milk"] },
    { name: "Fede", description: "Pomodoro, mozzarella e wurstel.", price: 6.5, allergens: ["gluten", "milk"] },
  ],
  "menu-fissi": [
    { name: "Menu Pranzo Completo", description: "Primo + secondo + contorno + acqua o vino della casa + caffè. Dal lunedì al venerdì, a pranzo.", price: 13.0, allergens: ["gluten"], featured: true, image: "/assets/img/table.webp" },
    { name: "Menu Pranzo Pizza", description: "Una pizza a scelta + una bibita. Dal lunedì al venerdì, a pranzo.", price: 13.0, allergens: ["gluten", "milk"], featured: true, image: "/assets/img/hero.webp" },
    { name: "Menu di Terra", description: "Affettato misto, risotto ai porcini e Castelmagno, arrosto ai funghi porcini con patatine. Acqua, vino della casa e caffè.", price: 27.0, allergens: ["gluten", "milk", "celery", "sulphites"], featured: true, image: "/assets/img/table.webp" },
    { name: "Menu di Mare", description: "Antipasto di pesce, pasta fresca ai frutti di mare, fritto misto con patatine. Acqua, vino della casa e caffè.", price: 32.0, allergens: ["gluten", "fish", "crustaceans", "molluscs", "sulphites"], featured: true, image: "/assets/img/seafood.webp" },
    { name: "Menu Bimbi", description: "Pasta al sugo o al ragù, nuggets di pollo con patatine. Acqua e bibita. Nei banchetti: 15 €.", price: 14.0, allergens: ["gluten", "milk", "eggs"] },
    { name: "Menù 1", description: "Spaghetti alle vongole, fritto misto, patatine e bibita a scelta. Asporto.", price: 20.0, allergens: ["gluten", "molluscs", "fish", "crustaceans", "eggs"] },
    { name: "Menù 2", description: "Maccheroncini alla Vecchia Cerro, cotoletta alla milanese, patatine e bibita. Asporto.", price: 16.0, allergens: ["gluten", "milk", "eggs", "celery"] },
    { name: "Menù 3", description: "Penne ai frutti di mare, gamberoni ai ferri, verdure alla griglia e bibita. Asporto.", price: 23.0, allergens: ["gluten", "crustaceans", "molluscs", "fish"] },
    { name: "Menù 4", description: "Pasta al ragù, nuggets di pollo, patatine e bibita. Asporto.", price: 14.0, allergens: ["gluten", "milk", "eggs", "celery"] },
    { name: "Menù 5", description: "Calamarata al ragù di cinghiale, arrosto ai funghi porcini e patatine. Asporto.", price: 21.0, allergens: ["gluten", "milk", "celery", "sulphites"] },
  ],
  dolci: [
    { name: "Cheesecake ai frutti di bosco", description: "Base biscotto, crema al formaggio e coulis di frutti di bosco.", price: 6.0, allergens: ["gluten", "milk", "eggs"], vegetarian: true },
    { name: "Tiramisù della casa", description: "Mascarpone, savoiardi, caffè espresso e cacao amaro.", price: 6.0, allergens: ["gluten", "milk", "eggs"], vegetarian: true, featured: true, image: "/assets/img/tiramisu.webp" },
    { name: "Salame al cioccolato", description: "Cioccolato, biscotti e burro. Il dolce dell'infanzia.", price: 5.5, allergens: ["gluten", "milk", "eggs"], vegetarian: true },
    { name: "Tartufo bianco e nero", description: "Gelato al cioccolato e fiordilatte, cuore di ciliegia.", price: 5.5, allergens: ["milk"], vegetarian: true, glutenFree: true },
    { name: "Panna cotta", description: "Panna cotta con salsa a scelta.", price: 5.5, allergens: ["milk"], vegetarian: true, glutenFree: true },
    { name: "Torroncino", description: "Semifreddo al torrone con granella di mandorle.", price: 5.5, allergens: ["milk", "nuts", "eggs"], vegetarian: true },
    { name: "Meringata", description: "Meringa, panna e cioccolato.", price: 5.5, allergens: ["milk", "eggs"], vegetarian: true, glutenFree: true },
    { name: "Macedonia", description: "Frutta fresca di stagione.", price: 6.0, allergens: [], vegetarian: true, vegan: true, glutenFree: true },
    { name: "Gnocco fritto alla nutella", description: "Gnocco fritto caldo e Nutella. Da condividere, forse.", price: 6.0, allergens: ["gluten", "milk", "nuts"], vegetarian: true },
    { name: "Tortino al cioccolato", description: "Tortino dal cuore caldo al cioccolato fondente.", price: 6.0, allergens: ["gluten", "milk", "eggs"], vegetarian: true },
    { name: "Sorbetto", description: "Sorbetto al limone.", price: 3.5, allergens: [], vegetarian: true, vegan: true, glutenFree: true },
    { name: "Semifreddo senza glutine e lattosio", description: "Semifreddo delicato, senza glutine e senza lattosio.", price: 6.5, allergens: ["eggs"], vegetarian: true, glutenFree: true },
    { name: "Coppa mascarpone", description: "Gelato al fiordilatte, crema al mascarpone, topping al passion fruit, panna montata e granella di pistacchi.", price: 6.0, allergens: ["milk", "nuts"], vegetarian: true },
    { name: "Coppa Nutella", description: "Gelato al fiordilatte, Nutella, panna montata, topping al cioccolato e granella di nocciole.", price: 6.0, allergens: ["milk", "nuts"], vegetarian: true },
    { name: "Coppa Oreo", description: "Gelato al cioccolato, gelato fiordilatte, crumble di biscotti Oreo, panna montata e topping al cioccolato.", price: 6.0, allergens: ["gluten", "milk", "soy"], vegetarian: true },
    { name: "Coppa fragolosa", description: "Fragole fresche, gelato al fiordilatte, panna montata e topping alla fragola.", price: 7.0, allergens: ["milk"], vegetarian: true },
  ],
  bevande: [
    { name: "Acqua naturale o frizzante 50 cl", description: "Acqua microfiltrata.", price: 1.5, allergens: [] },
    { name: "Acqua naturale o frizzante 75 cl", description: "Acqua microfiltrata.", price: 2.5, allergens: [] },
    { name: "Coca-Cola, Coca-Cola Zero, Aranciata, Sprite", description: "Bibita in lattina, 33 cl.", price: 3.0, allergens: [] },
    { name: "Thè alla pesca o al limone", description: "Thè freddo in lattina, 33 cl.", price: 3.0, allergens: [] },
    { name: "Caffè", description: "Espresso.", price: 1.5, allergens: [] },
    { name: "Caffè decaffeinato", description: "Espresso decaffeinato.", price: 1.5, allergens: [] },
    { name: "Caffè d'orzo", description: "Caffè d'orzo.", price: 1.5, allergens: ["gluten"] },
    { name: "Caffè corretto", description: "Espresso con un goccio di liquore.", price: 2.0, allergens: ["sulphites"] },
  ],
  birre: [
    { name: "Oettinger Pils 20 cl", description: "Birra pils alla spina, 4,7%.", price: 3.5, allergens: ["gluten"] },
    { name: "Oettinger Pils 40 cl", description: "Birra pils alla spina, 4,7%.", price: 5.5, allergens: ["gluten"] },
    { name: "Oettinger Weissbier 20 cl", description: "Birra weiss alla spina, 4,9%.", price: 4.0, allergens: ["gluten"] },
    { name: "Oettinger Weissbier 40 cl", description: "Birra weiss alla spina, 4,9%.", price: 6.0, allergens: ["gluten"] },
    { name: "Forhrenburger Rossa 20 cl", description: "Birra rossa alla spina, 5,5%.", price: 4.5, allergens: ["gluten"] },
    { name: "Forhrenburger Rossa 40 cl", description: "Birra rossa alla spina, 5,5%.", price: 6.5, allergens: ["gluten"] },
    { name: "Moretti 66 cl", description: "Birra Moretti in bottiglia, 4,8%.", price: 4.5, allergens: ["gluten"] },
  ],
  vini: [
    { name: "Vino della casa 1/4", description: "Rosso o bianco, 1/4 di litro.", price: 4.0, allergens: ["sulphites"] },
    { name: "Vino della casa 1/2", description: "Rosso o bianco, 1/2 litro.", price: 7.0, allergens: ["sulphites"] },
    { name: "Vino della casa 1 litro", description: "Rosso o bianco, 1 litro.", price: 12.0, allergens: ["sulphites"] },
    { name: "Barbera frizzante", description: "Bottiglia, 0,75 l.", price: 9.0, allergens: ["sulphites"] },
    { name: "Chardonnay frizzante", description: "Bottiglia, 0,75 l.", price: 9.0, allergens: ["sulphites"] },
    { name: "Prosecco millesimato", description: "Bottiglia, 0,75 l.", price: 15.0, allergens: ["sulphites"] },
  ],
  liquori: [
    { name: "Amari, grappe, brandy", description: "Selezione della casa.", price: 4.0, allergens: ["sulphites"] },
    { name: "Whisky, cognac, amari speciali", description: "Selezione della casa.", price: 4.5, allergens: ["sulphites"] },
    { name: "Grappa barricata", description: "Grappa invecchiata in botte.", price: 4.5, allergens: ["sulphites"] },
  ],
};

const existingItems = await sql`select count(*)::int as count from menu_items`;
if (existingItems[0].count === 0) {
  let inserted = 0;
  for (const [slug, items] of Object.entries(menu)) {
    const cat = (await sql`select id from categories where slug = ${slug} limit 1`)[0];
    if (!cat) continue;
    let order = 0;
    for (const item of items) {
      order += 1;
      const rows = await sql`
        insert into menu_items (
          category_id, name, description, price, image_url, is_available, is_featured,
          is_vegan, is_vegetarian, is_gluten_free, is_spicy, sort_order
        ) values (
          ${cat.id}, ${item.name}, ${item.description}, ${item.price}, ${item.image || ""},
          true, ${Boolean(item.featured)}, ${Boolean(item.vegan)}, ${Boolean(item.vegetarian)},
          ${Boolean(item.glutenFree)}, ${Boolean(item.spicy)}, ${order}
        ) returning id
      `;
      for (const code of item.allergens || []) {
        await sql`
          insert into menu_item_allergens (item_id, allergen_code)
          values (${rows[0].id}, ${code}) on conflict do nothing
        `;
      }
      inserted += 1;
    }
  }
  console.log(`✓ ${inserted} piatti inseriti`);
} else {
  console.log(`→ Menu già presente (${existingItems[0].count} piatti), seed saltato`);
}

// ---------------------------------------------------------------- promo
const promos = [
  { title: "Pranzo completo", description: "Primo, secondo, contorno, acqua o vino e caffè. Dal lunedì al venerdì, a pranzo.", badge: "€ 13", day: 1, order: 1 },
  { title: "Pizza & bibita", description: "Una pizza a scelta e una bibita. Il pranzo che mette d'accordo tutti.", badge: "€ 13", day: 1, order: 2 },
  { title: "Punti fedeltà", description: "1 punto per ogni euro speso. A 100 punti, 10 € di sconto sulla prossima visita.", badge: "Fedeltà", day: null, order: 3 },
];
const existingPromos = await sql`select count(*)::int as count from promos`;
if (existingPromos[0].count === 0) {
  for (const p of promos) {
    await sql`
      insert into promos (title, description, badge, day_of_week, sort_order)
      values (${p.title}, ${p.description}, ${p.badge}, ${p.day}, ${p.order})
    `;
  }
  console.log("✓ Promo inserite");
}

// ---------------------------------------------------------------- eventi
const events = [
  { title: "Compleanni e feste", subtitle: "La sala è tua", description: "Tavolate grandi, menu personalizzati e la torta alla fine. Pensiamo a tutto noi, tu pensa a divertirti.", image: "/assets/img/event-1.webp", badge: "Su misura", cta: "Richiedi informazioni", order: 1 },
  { title: "Battesimi, comunioni e cerimonie", subtitle: "Le occasioni che contano", description: "Spazi riservati, menu di terra e di mare e un servizio attento. Per celebrare insieme, come in famiglia.", image: "/assets/img/event-2.webp", badge: "Cerimonie", cta: "Parliamone", order: 2 },
  { title: "Cene aziendali", subtitle: "Team building, fine anno, lavoro", description: "Menu dedicati, sala riservata e la possibilità di organizzare la serata su misura per il tuo team.", image: "/assets/img/team.webp", badge: "Aziende", cta: "Richiedi preventivo", order: 3 },
  { title: "Serate in compagnia", subtitle: "Musica, karaoke e tavolate lunghe", description: "Le serate di Si Chef sono fatte per stare insieme: buon cibo, musica e quella allegria che si ricorda.", image: "/assets/img/event.webp", badge: "Sempre", cta: "Scopri di più", order: 4 },
];
const existingEvents = await sql`select count(*)::int as count from events`;
if (existingEvents[0].count === 0) {
  for (const e of events) {
    await sql`
      insert into events (title, subtitle, description, image_url, event_time, badge, cta_label, is_published, sort_order)
      values (${e.title}, ${e.subtitle}, ${e.description}, ${e.image}, '', ${e.badge}, ${e.cta}, true, ${e.order})
    `;
  }
  console.log("✓ Eventi inseriti");
}

// ---------------------------------------------------------------- gallery
const gallery = [
  ["/assets/img/team.webp", "La squadra di Si Chef", 1],
  ["/assets/img/venue-interior.webp", "La sala", 2],
  ["/assets/img/dish-grigliata.webp", "La grigliata di pesce", 3],
  ["/assets/img/dish-antipasto.webp", "Antipasto del marinaio", 4],
  ["/assets/img/risotto.webp", "Risotto della casa", 5],
  ["/assets/img/pizzaiolo.webp", "Il nostro pizzaiolo", 6],
  ["/assets/img/bar.webp", "Un brindisi", 7],
  ["/assets/img/dish-fritto.webp", "Fritto misto", 8],
  ["/assets/img/gallery-3.webp", "La sala apparecchiata", 9],
  ["/assets/img/pizzaoven.webp", "Il forno", 10],
];
const existingGallery = await sql`select count(*)::int as count from gallery_images`;
if (existingGallery[0].count === 0) {
  for (const [url, caption, order] of gallery) {
    await sql`
      insert into gallery_images (url, caption, sort_order, is_published)
      values (${url}, ${caption}, ${order}, true)
    `;
  }
  console.log("✓ Galleria inserita");
}

// ---------------------------------------------------------------- impostazioni
const settings = {
  venue: {
    name: "Ristorante Si Chef",
    tagline: "Ristorante · Pizzeria",
    claim: "La tradizione, servita con il sorriso.",
    address: "Via S. Clemente 151, 20023 Cerro Maggiore (MI)",
    phone: "0331 519111",
    phoneAlt: "339 600 0493",
    email: "ristorantesichef@gmail.com",
    whatsapp: "393396000493",
    instagram: "https://www.instagram.com/ristorantesichef/?hl=it",
    facebook: "https://www.facebook.com/ristorantesichef",
    maps: "https://www.google.com/maps/search/?api=1&query=Ristorante+Si+Chef+Via+San+Clemente+151+Cerro+Maggiore",
    coperto: "2,00 €",
    paymentNote: "Bancomat, Mastercard, Visa, Maestro e Apple Pay. Parcheggio, Wi-Fi e Sky.",
    deliveryFee: "3,00 €",
    deliveryMinimum: "20,00 €",
    deliveryNote: "Consegna a Cerro Maggiore e zone limitrofe. Ordine minimo 20 €.",
    parking: "Ampio parcheggio",
    services: "Climatizzato · Dehor · Wi-Fi · Sky · Parcheggio",
  },
  hero: {
    kicker: "Cerro Maggiore · tra Legnano e Saronno",
    title: "La tradizione ha un profumo buono.",
    subtitle: "Cucina italiana, pesce fresco, pizza dall'impasto della casa e un'accoglienza che sa di famiglia. Al Si Chef si mangia bene e si sta ancora meglio.",
    primaryCta: "Prenota un tavolo",
    secondaryCta: "Scopri il menu",
    image: "/assets/img/hero.webp",
    marquee: ["CUCINA ITALIANA", "PESCE FRESCO", "PIZZA ARTIGIANALE", "DOLCI DELLA CASA", "VINI & BOLLICINE", "A CERRO MAGGIORE"],
  },
  reservation: {
    notice: "Per gruppi superiori a 10 persone e cerimonie, chiamaci o scrivici: organizziamo tutto insieme.",
    slotMinutes: 30,
    lastSeating: "21:30",
    maxParty: 12,
    capacity: 90,
  },
  loyalty: {
    pointsPerEuro: 1,
    welcomePoints: 20,
    rewardThreshold: 100,
    rewardValue: 10,
    terms: "1 punto per ogni euro speso. 100 punti = 10 € di sconto. I punti possono essere utilizzati su una consumazione successiva, non sono cumulabili con altre promozioni e non hanno scadenza.",
  },
  order: {
    prepTime: 25,
    deliveryFee: 3,
    deliveryMinimum: 20,
    pickupNote: "Il tuo ordine sarà pronto per l'orario scelto. Ti avviseremo al telefono.",
    deliveryNote: "Consegna a Cerro Maggiore e zone limitrofe. Ordine minimo 20 €.",
  },
  seo: {
    title: "Ristorante Si Chef — Ristorante e pizzeria a Cerro Maggiore",
    description: "Cucina italiana, pesce fresco, pizza artigianale e menu pranzo a Cerro Maggiore (MI). Prenota online, ordina d'asporto o a domicilio.",
  },
};

for (const [key, value] of Object.entries(settings)) {
  await sql`
    insert into site_settings (key, value) values (${key}, ${JSON.stringify(value)}::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}
console.log("✓ Impostazioni");

console.log("\nSetup completato.");
console.log(`Admin: ${email} / ${password}`);
