import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
    USERS: 25,
    CONVERSATIONS: 50,
    MESSAGES_PER_CONVERSATION: { min: 5, max: 20 },
    REPLY_PROBABILITY: 0.3,
    VOTE_PROBABILITY: 0.6,
    SAVE_PROBABILITY: 0.2,
};

// Catégories enrichies
const CATEGORIES = [
    { name: "Tech", slug: "tech", color: "#3B82F6", icon: "💻" },
    { name: "Gaming", slug: "gaming", color: "#EF4444", icon: "🎮" },
    { name: "Design", slug: "design", color: "#8B5CF6", icon: "🎨" },
    { name: "Business", slug: "business", color: "#10B981", icon: "💼" },
    { name: "Science", slug: "science", color: "#F59E0B", icon: "🔬" },
    { name: "Apprentissage", slug: "learning", color: "#06B6D4", icon: "📚" },
    { name: "Carrière", slug: "career", color: "#EC4899", icon: "🎯" },
    { name: "Lifestyle", slug: "lifestyle", color: "#14B8A6", icon: "🌟" },
];

// Badges prédéfinis
const BADGES = [
    { name: "Premier Pas", description: "Créez votre première publication", icon: "🎯", color: "#3B82F6", requirement: "Créer 1 conversation" },
    { name: "Contributeur", description: "Créez 10 publications", icon: "✍️", color: "#10B981", requirement: "Créer 10 conversations" },
    { name: "Expert", description: "Créez 50 publications", icon: "🏆", color: "#F59E0B", requirement: "Créer 50 conversations" },
    { name: "Commentateur", description: "Postez 25 commentaires", icon: "💬", color: "#8B5CF6", requirement: "Poster 25 messages" },
    { name: "Populaire", description: "Recevez 100 votes positifs", icon: "⭐", color: "#EF4444", requirement: "Obtenir 100 karma" },
    { name: "Influenceur", description: "Recevez 500 votes positifs", icon: "🌟", color: "#F59E0B", requirement: "Obtenir 500 karma" },
    { name: "Vétéran", description: "Membre depuis plus d'un an", icon: "🎖️", color: "#6366F1", requirement: "Être membre depuis 1 an" },
    { name: "Social", description: "Répondez à 50 commentaires", icon: "🤝", color: "#14B8A6", requirement: "Répondre 50 fois" },
];

// Titres de conversations variés
const CONVERSATION_TITLES = {
    tech: [
        "Next.js 15 : Quelles sont les nouveautés ?",
        "Débat : TypeScript vs JavaScript en 2024",
        "Comment optimiser les performances de React ?",
        "Prisma vs Drizzle ORM : Votre avis ?",
        "Architecture micro-services : Bonnes pratiques",
        "Tailwind CSS : Pour ou contre ?",
        "Kubernetes pour les débutants",
        "GraphQL vs REST API en 2024",
        "Sécurité web : Les essentiels à connaître",
        "Clean Code : Vos meilleurs conseils",
    ],
    gaming: [
        "Elden Ring : Vos builds préférés ?",
        "PC Gaming : Quelle config en 2024 ?",
        "Indie Games à ne pas manquer",
        "Multiplayer : Vos meilleurs souvenirs",
        "Retrogaming : Vos classiques favoris",
        "Streaming : Conseils pour débuter",
        "VR Gaming : L'avenir du jeu vidéo ?",
        "Battle Royale : Quel est le meilleur ?",
        "RPG : Recommandations 2024",
        "Gaming Setup : Montrez vos installations",
    ],
    design: [
        "Figma vs Adobe XD : Le match",
        "Design System : Comment bien démarrer ?",
        "UI/UX Trends 2024",
        "Typographie : Vos polices préférées",
        "Portfolio : Conseils pour se démarquer",
        "Motion Design : Outils et ressources",
        "Accessibilité : Les bases essentielles",
        "Color Theory : Créer des palettes parfaites",
        "Logo Design : Process et inspiration",
        "Dark Mode : Meilleures pratiques",
    ],
    business: [
        "Startup : Comment trouver des investisseurs ?",
        "Remote Work : Organisation et productivité",
        "Marketing Digital : Stratégies efficaces",
        "Entrepreneuriat : Par où commencer ?",
        "SaaS Pricing : Comment fixer vos tarifs ?",
        "Freelance : Trouver vos premiers clients",
        "E-commerce : Plateformes et solutions",
        "Personal Branding : Construire sa présence",
        "Lean Startup : Retours d'expérience",
        "Growth Hacking : Tactiques qui marchent",
    ],
    science: [
        "IA et Machine Learning : Introduction",
        "Climat : Innovations et solutions",
        "Physique Quantique pour les curieux",
        "Biologie Moléculaire : Avancées récentes",
        "Astronomie : Découvertes fascinantes",
        "Neurosciences : Comment fonctionne le cerveau ?",
        "Énergie Renouvelable : Technologies d'avenir",
        "Génétique : CRISPR et édition génomique",
        "Mathématiques : Problèmes fascinants",
        "Chimie : Expériences étonnantes",
    ],
    learning: [
        "Apprendre à coder : Par où commencer ?",
        "Techniques de mémorisation efficaces",
        "Cours en ligne : Vos meilleures ressources",
        "Apprendre une langue : Méthodes qui marchent",
        "Certifications IT : Lesquelles valent le coup ?",
        "Autodidacte : Vos réussites et conseils",
        "Productivity : Gérer son temps d'apprentissage",
        "Books : Vos lectures qui ont tout changé",
        "Mentorship : Trouver un mentor",
        "Side Projects : Apprendre en pratiquant",
    ],
    career: [
        "Reconversion : Vos expériences ?",
        "Entretien d'embauche : Conseils et astuces",
        "CV et Portfolio : Comment se démarquer ?",
        "Négociation salariale : Vos techniques",
        "Soft Skills : Les plus importantes",
        "Burnout : Comment l'éviter ?",
        "Leadership : Devenir un bon manager",
        "Career Path : Tech Lead, Architect ou CTO ?",
        "Networking : Construire son réseau",
        "Work-Life Balance : Vos stratégies",
    ],
    lifestyle: [
        "Sport à la maison : Vos routines",
        "Cuisine : Recettes rapides et healthy",
        "Voyages : Destinations coup de cœur",
        "Minimalisme : Comment simplifier sa vie ?",
        "Productivité : Apps et outils favoris",
        "Lecture : Vos livres préférés 2024",
        "Hobbies : Que faites-vous pour décompresser ?",
        "DIY : Vos projets créatifs",
        "Musique : Artistes à découvrir",
        "Photos : Conseils pour progresser",
    ],
};

// Templates de messages en Markdown
const MESSAGE_TEMPLATES = [
    "Excellente question ! Voici mon point de vue :\n\n**Point principal** : {topic}\n\nJe pense que c'est important parce que {reason}.",
    "Je suis totalement d'accord ! J'ai eu une expérience similaire.\n\n> Citation pertinente\n\n{detail}",
    "Intéressant ! Voici quelques ressources utiles :\n\n- [Documentation officielle](https://example.com)\n- [Tutorial vidéo](https://example.com)\n- [Article de blog](https://example.com)",
    "D'après mon expérience :\n\n```typescript\n// Exemple de code\nconst solution = () => {\n  return 'Cette approche fonctionne bien';\n};\n```\n\nÇa marche parfaitement !",
    "Super sujet ! Voici ce que je recommande :\n\n1. **Première étape** : {step1}\n2. **Deuxième étape** : {step2}\n3. **Résultat** : {result}",
    "Je ne suis pas totalement d'accord. Voici pourquoi :\n\n*Point de vue alternatif* : {alternative}\n\nQu'en pensez-vous ?",
    "Merci pour ce partage ! 🙏\n\nJ'ai appris quelque chose de nouveau aujourd'hui.",
    "Question complémentaire : {question}\n\nJe suis curieux de connaître vos avis sur ce point spécifique.",
    "Voici un exemple concret :\n\n```bash\n# Commande utile\nnpm install {package}\n```\n\nN'oubliez pas de {reminder} !",
    "**TL;DR** : {summary}\n\n---\n\nPour les détails complets : {details}",
    "Je vois plusieurs approches possibles :\n\n| Approche | Avantages | Inconvénients |\n|----------|-----------|---------------|\n| A | Rapide | Limité |\n| B | Flexible | Complexe |",
    "🔥 Hot take : {opinion}\n\nJe sais que c'est controversé, mais laissez-moi expliquer...",
    "Pour ceux qui débutent, voici un guide simple :\n\n## Étape 1\n{step}\n\n## Étape 2\n{step}\n\n## Conclusion\n{conclusion}",
    "J'utilise cette solution depuis 6 mois et voici mon retour :\n\n**Avantages** :\n- ✅ {pro1}\n- ✅ {pro2}\n\n**Inconvénients** :\n- ❌ {con1}",
    "Alternative intéressante : {alternative}\n\nJ'ai testé les deux et voici la différence...",
];

// Générateur de contenu réaliste
function generateMarkdownContent(category: string): string {
    const templates = [
        `# Introduction\n\nBonjour à tous ! Je voulais partager mon expérience sur ${faker.lorem.words(3)}.\n\n## Contexte\n\n${faker.lorem.paragraph()}\n\n## Détails\n\n${faker.lorem.paragraph()}\n\nQu'en pensez-vous ?`,
        `**Question importante** : ${faker.lorem.sentence()}\n\nJ'ai essayé plusieurs approches :\n\n1. ${faker.lorem.sentence()}\n2. ${faker.lorem.sentence()}\n3. ${faker.lorem.sentence()}\n\nLaquelle préférez-vous ?`,
        `Voici mon avis sur ${faker.lorem.words(4)} :\n\n> ${faker.lorem.paragraph()}\n\nJe serais curieux de connaître vos retours !`,
        `\`\`\`typescript\n// Exemple de code\nfunction example() {\n  console.log('${faker.lorem.words(3)}');\n  return true;\n}\n\`\`\`\n\n${faker.lorem.paragraph()}`,
        `## ${faker.lorem.words(3)}\n\n${faker.lorem.paragraphs(2, '\n\n')}\n\n**Conclusion** : ${faker.lorem.sentence()}`,
    ];
    return faker.helpers.arrayElement(templates);
}

function generateMessage(): string {
    const template = faker.helpers.arrayElement(MESSAGE_TEMPLATES);
    return template
        .replace("{topic}", faker.lorem.words(3))
        .replace("{reason}", faker.lorem.sentence())
        .replace("{detail}", faker.lorem.paragraph())
        .replace("{step1}", faker.lorem.sentence())
        .replace("{step2}", faker.lorem.sentence())
        .replace("{result}", faker.lorem.sentence())
        .replace("{alternative}", faker.lorem.sentence())
        .replace("{question}", faker.lorem.sentence() + "?")
        .replace("{package}", faker.lorem.word())
        .replace("{reminder}", faker.lorem.words(4))
        .replace("{summary}", faker.lorem.sentence())
        .replace("{details}", faker.lorem.paragraph())
        .replace("{opinion}", faker.lorem.sentence())
        .replace("{step}", faker.lorem.sentence())
        .replace("{conclusion}", faker.lorem.sentence())
        .replace("{pro1}", faker.lorem.words(4))
        .replace("{pro2}", faker.lorem.words(4))
        .replace("{con1}", faker.lorem.words(4));
}

async function main() {
    console.log("🌱 Début du seed complet et détaillé...\n");

    // Nettoyage complet
    console.log("🧹 Nettoyage de la base de données...");
    await prisma.userBadge.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.savedConversation.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Nettoyage terminé\n");

    // Création des catégories
    console.log("📁 Création des catégories...");
    const categories = [];
    for (const cat of CATEGORIES) {
        const created = await prisma.category.create({ data: cat });
        categories.push(created);
        console.log(`  ✓ ${cat.icon} ${cat.name}`);
    }
    console.log(`✅ ${categories.length} catégories créées\n`);

    // Création des badges
    console.log("🏆 Création des badges...");
    const badges = [];
    for (const badge of BADGES) {
        const created = await prisma.badge.create({ data: badge });
        badges.push(created);
        console.log(`  ✓ ${badge.icon} ${badge.name}`);
    }
    console.log(`✅ ${badges.length} badges créés\n`);

    // Création des utilisateurs
    console.log("👥 Création des utilisateurs...");
    const users = [];
    
    // Utilisateur admin/seed
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@forum.com",
            name: "Admin Forum",
            password: "$2b$10$zwNQvK4RFSmPlv2bW.MuzeZ3d05cqLNtAMD4Y8bnkYbkM8yt.ubI6", // password
            bio: "Administrateur du forum - Développeur passionné par les nouvelles technologies",
            karma: 1000,
            image: null,
            role: "ADMIN",
            emailVerified: new Date(),
        } as any,
    });
    users.push(adminUser);
    console.log(`  ✓ Admin: ${adminUser.email}`);

    // Utilisateurs réalistes
    for (let i = 0; i < CONFIG.USERS; i++) {
        const firstName = faker.person.firstName();
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email({ firstName }),
                name: `${firstName} ${faker.person.lastName()}`,
                password: "$2b$10$zwNQvK4RFSmPlv2bW.MuzeZ3d05cqLNtAMD4Y8bnkYbkM8yt.ubI6",
                bio: Math.random() > 0.5 ? faker.person.bio() : null,
                karma: Math.floor(Math.random() * 500),
                image: null,
                role: Math.random() < 0.1 ? "MODERATOR" : "USER",
                emailVerified: new Date(),
            } as any,
        });
        users.push(user);
        if ((i + 1) % 5 === 0) {
            console.log(`  ✓ ${i + 1} utilisateurs créés...`);
        }
    }
    console.log(`✅ ${users.length} utilisateurs créés\n`);

    // Attribution de badges aux utilisateurs actifs
    console.log("🎖️ Attribution des badges...");
    let badgeCount = 0;
    for (const user of users.slice(0, 10)) {
        const numBadges = Math.floor(Math.random() * 3) + 1;
        const selectedBadges = faker.helpers.arrayElements(badges, numBadges);
        
        for (const badge of selectedBadges) {
            await prisma.userBadge.create({
                data: {
                    userId: user.id,
                    badgeId: badge.id,
                },
            });
            badgeCount++;
        }
    }
    console.log(`✅ ${badgeCount} badges attribués\n`);

    // Création des conversations avec messages
    console.log("💬 Création des conversations et messages...");
    const conversations = [];
    let totalMessages = 0;

    for (let i = 0; i < CONFIG.CONVERSATIONS; i++) {
        const author = faker.helpers.arrayElement(users);
        const category = faker.helpers.arrayElement(categories);
        const categorySlug = category.slug as keyof typeof CONVERSATION_TITLES;
        
        // Sélectionner un titre approprié à la catégorie
        const titles = CONVERSATION_TITLES[categorySlug] || CONVERSATION_TITLES.tech;
        const title = faker.helpers.arrayElement(titles);
        
        const conversation = await prisma.conversation.create({
            data: {
                title,
                content: generateMarkdownContent(category.name),
                votes: Math.floor(Math.random() * 1000) - 200, // votes peuvent être négatifs
                userId: author.id,
                categoryId: category.id,
                isPinned: Math.random() > 0.95, // 5% de conversations épinglées
                isLocked: Math.random() > 0.98, // 2% de conversations verrouillées
                createdAt: faker.date.past({ years: 1 }),
            },
        });
        conversations.push(conversation);

        // Créer le premier message (contenu de la conversation)
        const firstMessage = await prisma.message.create({
            data: {
                content: generateMarkdownContent(category.name),
                conversationId: conversation.id,
                userId: author.id,
                votes: Math.floor(Math.random() * 100) - 20,
                createdAt: conversation.createdAt,
            },
        });
        totalMessages++;

        // Créer les réponses
        const messageIds = [firstMessage.id];
        const numMessages = faker.number.int(CONFIG.MESSAGES_PER_CONVERSATION);
        
        for (let j = 0; j < numMessages; j++) {
            const messageAuthor = faker.helpers.arrayElement(users);
            const isReply = messageIds.length > 0 && Math.random() < CONFIG.REPLY_PROBABILITY;
            const parentId = isReply ? faker.helpers.arrayElement(messageIds) : null;
            
            const message = await prisma.message.create({
                data: {
                    content: generateMessage(),
                    conversationId: conversation.id,
                    userId: messageAuthor.id,
                    parentId,
                    votes: Math.floor(Math.random() * 50) - 10,
                    createdAt: faker.date.between({
                        from: conversation.createdAt,
                        to: new Date(),
                    }),
                },
            });
            messageIds.push(message.id);
            totalMessages++;
        }

        if ((i + 1) % 10 === 0) {
            console.log(`  ✓ ${i + 1} conversations créées...`);
        }
    }
    console.log(`✅ ${conversations.length} conversations et ${totalMessages} messages créés\n`);

    // Création des votes
    console.log("⬆️ Création des votes...");
    let voteCount = 0;
    
    for (const conversation of conversations) {
        for (const user of users) {
            if (Math.random() < CONFIG.VOTE_PROBABILITY && user.id !== conversation.userId) {
                const value = Math.random() > 0.3 ? 1 : -1; // 70% upvotes, 30% downvotes
                
                await prisma.vote.create({
                    data: {
                        userId: user.id,
                        conversationId: conversation.id,
                        value,
                    },
                });
                voteCount++;
            }
        }
    }
    console.log(`✅ ${voteCount} votes créés\n`);

    // Création des sauvegardes
    console.log("⭐ Création des sauvegardes...");
    let saveCount = 0;
    
    for (const user of users) {
        for (const conversation of conversations) {
            if (Math.random() < CONFIG.SAVE_PROBABILITY) {
                await prisma.savedConversation.create({
                    data: {
                        userId: user.id,
                        conversationId: conversation.id,
                    },
                });
                saveCount++;
            }
        }
    }
    console.log(`✅ ${saveCount} sauvegardes créées\n`);

    // Création des notifications
    console.log("🔔 Création des notifications...");
    let notificationCount = 0;
    
    for (const user of users.slice(0, 15)) {
        const numNotifications = faker.number.int({ min: 2, max: 8 });
        
        for (let i = 0; i < numNotifications; i++) {
            const types = ["reply", "mention", "upvote", "badge"];
            const type = faker.helpers.arrayElement(types);
            
            const titles = {
                reply: "Nouvelle réponse",
                mention: "Vous avez été mentionné",
                upvote: "Votre publication a été votée",
                badge: "Nouveau badge obtenu !",
            };
            
            const messages = {
                reply: `${faker.person.firstName()} a répondu à votre commentaire`,
                mention: `${faker.person.firstName()} vous a mentionné dans une discussion`,
                upvote: `Votre publication a reçu ${faker.number.int({ min: 5, max: 50 })} nouveaux votes`,
                badge: `Vous avez obtenu le badge "${faker.helpers.arrayElement(badges).name}"`,
            };
            
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type,
                    title: titles[type as keyof typeof titles],
                    message: messages[type as keyof typeof messages],
                    link: `/conversation/${faker.helpers.arrayElement(conversations).id}`,
                    read: Math.random() > 0.4, // 60% déjà lues
                    createdAt: faker.date.recent({ days: 30 }),
                },
            });
            notificationCount++;
        }
    }
    console.log(`✅ ${notificationCount} notifications créées\n`);

    // Statistiques finales
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 SEED COMPLET TERMINÉ AVEC SUCCÈS !");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("📊 Statistiques :");
    console.log(`  👥 Utilisateurs      : ${users.length}`);
    console.log(`  📁 Catégories        : ${categories.length}`);
    console.log(`  🏆 Badges            : ${badges.length}`);
    console.log(`  💬 Conversations     : ${conversations.length}`);
    console.log(`  💭 Messages          : ${totalMessages}`);
    console.log(`  ⬆️  Votes             : ${voteCount}`);
    console.log(`  ⭐ Sauvegardes       : ${saveCount}`);
    console.log(`  🔔 Notifications     : ${notificationCount}`);
    console.log(`  🎖️  Badges attribués  : ${badgeCount}`);
    
    console.log("\n💡 Compte de test :");
    console.log(`  Email    : admin@forum.com`);
    console.log(`  Password : password`);
    
    console.log("\n🚀 Le forum est prêt à être utilisé !");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
    .catch((e) => {
        console.error("❌ Erreur lors du seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

