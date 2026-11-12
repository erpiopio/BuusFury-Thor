// Authored translations of the existing bundled menu catalogs.
// These are presentation strings, not evidence of support for translated ROMs.
// Run with node tools/build_thor_content_catalogs.js after editing this file.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../android/app/src/main/assets');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const equipmentNames = read('thor_equipment_names.json');
const equipmentDescriptions = read('thor_equipment_descriptions.json');
const inventory = read('thor_inventory_catalog.json').pestanas.flat();
const skills = read('thor_skills.json');
const quests = read('thor_quests.json').misiones;
const source = {
    equipmentName: equipmentNames,
    equipmentDescription: equipmentDescriptions,
    inventoryName: inventory.map(item => item.nombre),
    inventoryDescription: inventory.map(item => item.descripcion),
    skill: skills.map(item => item.nombre),
    quest: quests.map(item => item.texto)
};
const locales = {es: source};
for (const tag of ['en', 'fr', 'pt-BR']) {
    locales[tag] = {};
    for (const [kind, values] of Object.entries(source))
        locales[tag][kind] = values.map(value => value === '' ? '' : null);
}
function rows(kind, table) {
    for (const line of table.trim().split('\n')) {
        const [id, en, fr, pt] = line.split('|');
        if (!id || en === undefined || fr === undefined || pt === undefined)
            throw new Error('Invalid translation row: ' + line);
        ['en', 'fr', 'pt-BR'].forEach((tag, column) => {
            const index = Number(id);
            if (locales[tag][kind][index] != null)
                throw new Error('Duplicate translation: ' + tag + '/' + kind + '/' + id);
            locales[tag][kind][index] = [en, fr, pt][column];
        });
    }
}
rows('equipmentName', `
1|Dirty Shirt|Chemise sale|Camisa suja
2|Dirty Gi|Gi sale|Gi sujo
3|Dirty Armor|Armure sale|Armadura suja
4|Prototype Space Armor|Armure spatiale prototype|Armadura espacial protótipo
5|Cotton Gi|Gi en coton|Gi de algodão
6|Wool Sweater|Pull en laine|Suéter de lã
7|Leather Jacket|Veste en cuir|Jaqueta de couro
8|Reflective Robe|Robe réfléchissante|Túnica refletora
9|Clean Shirt|Chemise propre|Camisa limpa
10|Wooden Armor|Armure en bois|Armadura de madeira
11|Fancy Suit|Costume élégant|Terno elegante
12|Stone O-Yoroi|O-yoroi en pierre|O-Yoroi de pedra
13|Bronze Keiko|Keiko en bronze|Keiko de bronze
14|Halloween Costume|Costume d'Halloween|Fantasia de Halloween
15|Darkness Armor|Armure des ténèbres|Armadura das trevas
16|Jade Keiko|Keiko en jade|Keiko de jade
17|Clean Gi|Gi propre|Gi limpo
18|Iron Armor|Armure en fer|Armadura de ferro
19|Bruiser Coat|Manteau de brute|Casaco de valentão
20|Spiked Breastplate|Cuirasse à pointes|Couraça de espinhos
21|Mystic Aegis|Égide mystique|Égide mística
22|Shadow Do-Maru|Do-maru des ombres|Do-Maru das sombras
23|Silver Armor|Armure en argent|Armadura de prata
24|Monk Robe|Robe de moine|Túnica de monge
25|Pyrite Armor|Armure en pyrite|Armadura de pirita
26|Gold Armor|Armure en or|Armadura de ouro
27|Fancy Haori|Haori élégant|Haori elegante
28|Light Armor|Armure de lumière|Armadura da luz
29|Rhinestone Suit|Costume à strass|Terno de pedrarias
30|Shiny Armor|Armure brillante|Armadura reluzente
31|Platinum Armor|Armure en platine|Armadura de platina
32|Power Suit|Combinaison de puissance|Traje de força
33|Enhanced Space Armor|Armure spatiale améliorée|Armadura espacial aprimorada
34|Dragon Armor|Armure de dragon|Armadura de dragão
35|Super Armor|Super armure|Superarmadura
36|Diving Suit|Combinaison de plongée|Roupa de mergulho
37|Diamond Armor|Armure en diamant|Armadura de diamante
38|Bad Man Shirt|Chemise « Bad Man »|Camisa « Bad Man »
39|Titanium Breastplate|Cuirasse en titane|Couraça de titânio
40|Saiyan Armor|Armure saiyenne|Armadura saiyajin
41|Crystal O-Yoroi|O-yoroi en cristal|O-Yoroi de cristal
42|Z Armor|Armure Z|Armadura Z
43|Geromantium Kataginu|Kataginu en géromantium|Kataginu de geromântio
45|Dirty Gloves|Gants sales|Luvas sujas
46|Dirty Gauntlets|Gantelets sales|Manoplas sujas
47|Prototype Energy Gloves|Gants énergétiques prototypes|Luvas de energia protótipo
48|Cotton Gloves|Gants en coton|Luvas de algodão
49|1-Ton Armbands|Brassards d'une tonne|Braçadeiras de 1 tonelada
50|Wool Mittens|Moufles en laine|Luvas de lã
51|Reflective Gloves|Gants réfléchissants|Luvas refletoras
52|2-Ton Armbands|Brassards de 2 tonnes|Braçadeiras de 2 toneladas
53|Leather Gloves|Gants en cuir|Luvas de couro
54|Clean Gloves|Gants propres|Luvas limpas
55|Brass Knuckles|Poings américains|Soco-inglês
56|Pilaf Gloves|Gants de Pilaf|Luvas de Pilaf
57|10-Ton Armbands|Brassards de 10 tonnes|Braçadeiras de 10 toneladas
58|Iron Armlet|Bracelet en fer|Bracelete de ferro
59|Silver Gauntlets|Gantelets en argent|Manoplas de prata
60|Wizard Gloves|Gants de mage|Luvas de mago
61|Charge Gloves|Gants de charge|Luvas de carga
62|20-Ton Armbands|Brassards de 20 tonnes|Braçadeiras de 20 toneladas
63|Super Gloves|Super gants|Superluvas
64|Clean Gauntlets|Gantelets propres|Manoplas limpas
65|Platinum Gauntlets|Gantelets en platine|Manoplas de platina
66|Bruiser Gloves|Gants de brute|Luvas de valentão
67|100-Ton Armbands|Brassards de 100 tonnes|Braçadeiras de 100 toneladas
68|Diamond Gauntlets|Gantelets en diamant|Manoplas de diamante
69|Power Gauntlets|Gantelets de puissance|Manoplas de poder
70|Enhanced Energy Gloves|Gants énergétiques améliorés|Luvas de energia aprimoradas
71|Diving Gloves|Gants de plongée|Luvas de mergulho
72|Kiloton Armbands|Brassards d'une kilotonne|Braçadeiras de quilotonelada
73|Saiyan Gloves|Gants saiyens|Luvas saiyajins
74|Crystal Gauntlets|Gantelets en cristal|Manoplas de cristal
75|Geromantis Gloves|Gants en géromantis|Luvas de geromantis
76|Geromantium Gloves|Gants en géromantium|Luvas de geromântio
78|Dirty Tabi|Tabi sales|Tabi sujas
79|Dirty Shoes|Chaussures sales|Sapatos sujos
80|Prototype Hypersonic Boots|Bottes hypersoniques prototypes|Botas hipersônicas protótipo
81|Dirty Boots|Bottes sales|Botas sujas
82|Cotton Tabi|Tabi en coton|Tabi de algodão
83|1-Ton Boots|Bottes d'une tonne|Botas de 1 tonelada
84|Wool Shoes|Chaussures en laine|Sapatos de lã
85|Leather Loafers|Mocassins en cuir|Mocassins de couro
86|2-Ton Boots|Bottes de 2 tonnes|Botas de 2 toneladas
87|Clean Tabi|Tabi propres|Tabi limpas
88|Wooden Geta|Geta en bois|Geta de madeira
89|Sneakers|Baskets|Tênis
90|10-Ton Boots|Bottes de 10 tonnes|Botas de 10 toneladas
91|Stone Geta|Geta en pierre|Geta de pedra
92|Alligator Loafers|Mocassins en alligator|Mocassins de jacaré
93|Spirit Geta|Geta spirituelles|Geta espirituais
94|Bronze-Plated Boots|Bottes plaquées bronze|Botas revestidas de bronze
95|Iron Greaves|Jambières en fer|Grevas de ferro
96|20-Ton Boots|Bottes de 20 tonnes|Botas de 20 toneladas
97|Flippers|Palmes|Nadadeiras
98|Clean Shoes|Chaussures propres|Sapatos limpos
99|Silver Boots|Bottes en argent|Botas de prata
100|Fake Silver Boots|Fausses bottes en argent|Botas prateadas falsas
101|Super Boots|Super bottes|Superbotas
102|100-Ton Boots|Bottes de 100 tonnes|Botas de 100 toneladas
103|Gold Boots|Bottes en or|Botas de ouro
104|Electric Boots|Bottes électriques|Botas elétricas
105|Enhanced Hypersonic Boots|Bottes hypersoniques améliorées|Botas hipersônicas aprimoradas
106|Kiloton Boots|Bottes d'une kilotonne|Botas de quilotonelada
107|Saiyan Boots|Bottes saiyennes|Botas saiyajins
108|Clean Boots|Bottes propres|Botas limpas
109|Winged Sandals|Sandales ailées|Sandálias aladas
110|Soccer Boots|Chaussures de football|Chuteiras
111|Geromantium Tabi|Tabi en géromantium|Tabi de geromântio
113|Dirty Cape|Cape sale|Capa suja
114|Dirty Belt|Ceinture sale|Cinto sujo
115|Luxury Watch|Montre de luxe|Relógio de luxo
116|White Belt|Ceinture blanche|Faixa branca
117|Rhinestone Sunglasses|Lunettes à strass|Óculos de pedrarias
118|Ancient Straw|Paille antique|Canudo ancestral
119|Majestic Chopsticks|Baguettes majestueuses|Hashis majestosos
120|Wool Cap|Bonnet en laine|Gorro de lã
121|Lucky Charm|Porte-bonheur|Amuleto da sorte
122|Stone Mask|Masque en pierre|Máscara de pedra
123|Quartz Charm|Amulette en quartz|Amuleto de quartzo
124|Yellow Belt|Ceinture jaune|Faixa amarela
125|Topaz Charm|Amulette en topaze|Amuleto de topázio
126|Bandana|Bandana|Bandana
127|Red Belt|Ceinture rouge|Faixa vermelha
128|Demon Mask|Masque démoniaque|Máscara demoníaca
129|Monocle|Monocle|Monóculo
130|Amethyst Charm|Amulette en améthyste|Amuleto de ametista
131|Fake Rabbit's Foot|Fausse patte de lapin|Pé de coelho falso
132|Green Belt|Ceinture verte|Faixa verde
133|Snorkel|Tuba|Snorkel
134|Clean Cape|Cape propre|Capa limpa
135|Garlic Necklace|Collier d'ail|Colar de alho
136|Rabbit's Foot|Patte de lapin|Pé de coelho
137|Sapphire Charm|Amulette en saphir|Amuleto de safira
138|Skull Ring|Bague à tête de mort|Anel de caveira
139|Black Cape|Cape noire|Capa preta
140|Super Cape|Super cape|Supercapa
141|Light Talisman|Talisman de lumière|Talismã da luz
142|Emerald Charm|Amulette en émeraude|Amuleto de esmeralda
143|Doom Charm|Amulette de perdition|Amuleto da perdição
144|Polka-Dot Kazoo|Kazoo à pois|Kazoo de bolinhas
145|Iron Kabuto|Kabuto en fer|Kabuto de ferro
146|Ox-King's Hat|Chapeau du roi Gyumao|Chapéu do Rei Cutelo
147|Evil Talisman|Talisman maléfique|Talismã maligno
148|Crystal Pendant|Pendentif en cristal|Pingente de cristal
149|Blue Belt|Ceinture bleue|Faixa azul
150|Mercury Cap|Casquette de Mercure|Boné de Mercúrio
151|Four-Leaf Clover|Trèfle à quatre feuilles|Trevo de quatro folhas
152|Vampire Cape|Cape vampirique|Capa vampírica
153|Crisis Ring|Anneau de crise|Anel de crise
154|Brown Belt|Ceinture marron|Faixa marrom
155|Ruby Charm|Amulette en rubis|Amuleto de rubi
156|Ancient Cameo|Camée antique|Camafeu ancestral
157|Black Belt|Ceinture noire|Faixa preta
158|Diamond Charm|Amulette en diamant|Amuleto de diamante
159|Clean Belt|Ceinture propre|Cinto limpo
160|Geromantium Bandana|Bandana en géromantium|Bandana de geromântio
161|Gokuu Hat|Chapeau « Gokuu »|Chapéu « Gokuu »
`);

// Repeated descriptions keep the same gameplay meaning for every weight tier.
for (const id of [49, 52, 57, 62, 67, 72]) rows('equipmentDescription', `${id}|Heavy armbands slow you down but grant more experience.|Les brassards lourds vous ralentissent, mais rapportent plus d'expérience.|Braçadeiras pesadas deixam você mais lento, mas concedem mais experiência.`);
for (const id of [83, 86, 90, 96, 102, 106]) rows('equipmentDescription', `${id}|Heavy boots slow you down but grant more experience.|Les bottes lourdes vous ralentissent, mais rapportent plus d'expérience.|Botas pesadas deixam você mais lento, mas concedem mais experiência.`);
rows('equipmentDescription', `
1|You should clean this shirt before wearing it.|Il faudrait laver cette chemise avant de la porter.|É melhor lavar esta camisa antes de usá-la.
2|You should clean this gi before wearing it.|Il faudrait laver ce gi avant de le porter.|É melhor lavar este gi antes de usá-lo.
3|You should clean this armor before wearing it.|Il faudrait nettoyer cette armure avant de la porter.|É melhor limpar esta armadura antes de usá-la.
4|A prototype that does not work yet.|Un prototype qui ne fonctionne pas encore.|É um protótipo que ainda não funciona.
5|A simple cotton gi.|Un simple gi en coton.|Um gi simples de algodão.
6|A thick wool sweater.|Un pull épais en laine.|Um suéter grosso de lã.
7|A very cool leather jacket.|Une veste en cuir très classe.|Uma jaqueta de couro muito estilosa.
8|A reflective robe resistant to energy attacks.|Une robe réfléchissante qui résiste aux attaques d'énergie.|Uma túnica refletora resistente a ataques de energia.
9|A shirt so clean it shines!|Une chemise si propre qu'elle brille !|Uma camisa tão limpa que brilha!
10|Armor carved from wood.|Une armure taillée dans le bois.|Armadura esculpida em madeira.
11|This suit looks expensive.|Ce costume a l'air coûteux.|Este terno parece caro.
12|Traditional samurai armor carved from stone.|Une armure traditionnelle de samouraï taillée dans la pierre.|Armadura tradicional de samurai esculpida em pedra.
13|Traditional samurai scale armor made of bronze.|Une armure traditionnelle de samouraï à écailles de bronze.|Armadura tradicional de escamas de samurai feita de bronze.
14|A terrifying Halloween costume.|Un costume d'Halloween terrifiant.|Uma fantasia de Halloween assustadora.
15|This magic armor restores HP faster during melee attacks.|Cette armure magique rend des PV plus vite lors des attaques au corps à corps.|Esta armadura mágica recupera PV mais rápido em ataques corpo a corpo.
16|Traditional jade samurai armor that reduces damage when blocking.|Une armure de samouraï en jade qui réduit les dégâts en garde.|Armadura tradicional de samurai feita de jade que reduz o dano ao bloquear.
17|A gi so clean it shines!|Un gi si propre qu'il brille !|Um gi tão limpo que brilha!
18|An iron breastplate.|Une cuirasse en fer.|Uma couraça de ferro.
19|The sort of coat a real tough guy would wear.|Le genre de manteau que porterait une vraie brute.|O tipo de casaco que um valentão de verdade usaria.
20|This breastplate is covered in sharp spikes.|Cette cuirasse est couverte de pointes acérées.|Esta couraça é coberta de espinhos afiados.
21|A mystic breastplate that reduces energy-block costs.|Une cuirasse mystique qui réduit le coût de la garde énergétique.|Uma couraça mística que reduz o custo do bloqueio de energia.
22|Traditional samurai armor suited to stealth.|Une armure traditionnelle de samouraï adaptée à la discrétion.|Armadura tradicional de samurai adequada à furtividade.
23|A silver breastplate.|Une cuirasse en argent.|Uma couraça de prata.
24|A simple monk's robe suited to stealth.|Une simple robe de moine adaptée à la discrétion.|Uma túnica simples de monge adequada à furtividade.
25|It looks like gold armor, but the gold is fake!|Elle ressemble à une armure en or, mais c'est du faux !|Parece uma armadura de ouro, mas o ouro é falso!
26|A gold breastplate.|Une cuirasse en or.|Uma couraça de ouro.
27|This elegant jacket gives you plenty of charisma.|Cette veste élégante vous donne beaucoup de charisme.|Esta jaqueta elegante dá muito carisma.
28|This magic armor restores energy faster during melee attacks.|Cette armure magique rend de l'énergie plus vite au corps à corps.|Esta armadura mágica recupera energia mais rápido em ataques corpo a corpo.
29|A very tacky suit.|Un costume vraiment tape-à-l'œil.|Um terno muito cafona.
30|Armor so clean it shines!|Une armure si propre qu'elle brille !|Uma armadura tão limpa que brilha!
31|A platinum breastplate.|Une cuirasse en platine.|Uma couraça de platina.
32|This suit is infused with the power of science.|Cette combinaison est imprégnée du pouvoir de la science.|Este traje está imbuído do poder da ciência.
33|This high-tech breastplate emits an electronic aura.|Cette cuirasse technologique dégage une aura électronique.|Esta couraça tecnológica emite uma aura eletrônica.
34|Dragon-scale armor that reduces energy-attack costs.|Une armure en écailles de dragon qui réduit le coût des attaques d'énergie.|Armadura de escamas de dragão que reduz o custo dos ataques de energia.
35|Magic armor that makes Super Saiyan transformations last longer.|Une armure magique qui prolonge les transformations en Super Saiyan.|Armadura mágica que prolonga as transformações em Super Saiyajin.
36|This suit helps you fish better.|Cette combinaison vous aide à mieux pêcher.|Esta roupa ajuda você a pescar melhor.
37|A breastplate carved from a giant diamond.|Une cuirasse taillée dans un diamant géant.|Uma couraça esculpida em um diamante gigante.
38|A pink shirt? Who would wear something so ridiculous?|Une chemise rose ? Qui porterait quelque chose d'aussi ridicule ?|Uma camisa rosa? Quem usaria algo tão ridículo?
39|A titanium breastplate.|Une cuirasse en titane.|Uma couraça de titânio.
40|Armor like that once worn by the Saiyans.|Une armure semblable à celles que portaient les Saiyans.|Armadura como a que os saiyajins usavam.
41|This armor's crystals strengthen your energy attacks.|Les cristaux de cette armure renforcent vos attaques d'énergie.|Os cristais desta armadura fortalecem seus ataques de energia.
42|This magic armor constantly heals you.|Cette armure magique vous soigne en permanence.|Esta armadura mágica cura você constantemente.
43|Traditional samurai clothing made of Geromantium.|Une tenue traditionnelle de samouraï en géromantium.|Uma vestimenta tradicional de samurai feita de geromântio.
45|You should clean these gloves before wearing them.|Il faudrait laver ces gants avant de les porter.|É melhor lavar estas luvas antes de usá-las.
46|You should clean these gauntlets before wearing them.|Il faudrait nettoyer ces gantelets avant de les porter.|É melhor limpar estas manoplas antes de usá-las.
47|Prototypes that do not work yet.|Des prototypes qui ne fonctionnent pas encore.|São protótipos que ainda não funcionam.
48|A pair of simple cotton gloves.|Une paire de simples gants en coton.|Um par de luvas simples de algodão.
50|A pair of thick wool mittens.|Une paire de moufles épaisses en laine.|Um par de luvas grossas de lã.
51|Reflective gloves resistant to energy attacks.|Des gants réfléchissants qui résistent aux attaques d'énergie.|Luvas refletoras resistentes a ataques de energia.
53|Tough leather gloves.|Des gants en cuir robuste.|Luvas de couro resistente.
54|Gloves so clean they shine!|Des gants si propres qu'ils brillent !|Luvas tão limpas que brilham!
55|A pair of brass knuckles.|Une paire de poings américains en laiton.|Um par de socos-ingleses de latão.
56|Legend says these gloves will make you rich!|La légende dit que ces gants vous rendront riche !|Dizem que estas luvas farão você ficar rico!
58|An iron armlet.|Un bracelet en fer.|Um bracelete de ferro.
59|A pair of silver gauntlets.|Une paire de gantelets en argent.|Um par de manoplas de prata.
60|Magic gloves that reduce energy-block costs.|Des gants magiques qui réduisent le coût de la garde énergétique.|Luvas mágicas que reduzem o custo do bloqueio de energia.
61|You can feel energy flowing through these high-tech gloves.|On sent l'énergie circuler dans ces gants technologiques.|É possível sentir a energia fluindo por estas luvas tecnológicas.
63|Magic gloves that make Super Saiyan transformations last longer.|Des gants magiques qui prolongent les transformations en Super Saiyan.|Luvas mágicas que prolongam as transformações em Super Saiyajin.
64|Gauntlets so clean they shine!|Des gantelets si propres qu'ils brillent !|Manoplas tão limpas que brilham!
65|A pair of platinum gauntlets.|Une paire de gantelets en platine.|Um par de manoplas de platina.
66|The sort of gloves a real tough guy would wear.|Le genre de gants que porterait une vraie brute.|O tipo de luvas que um valentão de verdade usaria.
68|A pair of gauntlets carved from a diamond.|Une paire de gantelets taillés dans un diamant.|Um par de manoplas esculpidas em um diamante.
69|These gauntlets glow with energy.|Ces gantelets brillent d'énergie.|Estas manoplas brilham com energia.
70|Powerful high-tech gloves.|De puissants gants technologiques.|Luvas tecnológicas poderosas.
71|These gloves help you fish better.|Ces gants vous aident à mieux pêcher.|Estas luvas ajudam você a pescar melhor.
73|Gloves like those once worn by the Saiyans.|Des gants semblables à ceux que portaient les Saiyans.|Luvas como as que os saiyajins usavam.
74|These gauntlets' crystals strengthen your energy attacks.|Les cristaux de ces gantelets renforcent vos attaques d'énergie.|Os cristais destas manoplas fortalecem seus ataques de energia.
75|They look like Geromantium gloves, but are cheap imitations.|Ils ressemblent à des gants en géromantium, mais ce sont des imitations bon marché.|Parecem luvas de geromântio, mas são imitações baratas.
76|A pair of Geromantium gloves.|Une paire de gants en géromantium.|Um par de luvas de geromântio.
78|You should clean these tabi boots before wearing them.|Il faudrait laver ces bottes tabi avant de les porter.|É melhor lavar estas botas tabi antes de usá-las.
79|You should clean these shoes before wearing them.|Il faudrait nettoyer ces chaussures avant de les porter.|É melhor limpar estes sapatos antes de usá-los.
80|Prototypes that do not work yet.|Des prototypes qui ne fonctionnent pas encore.|São protótipos que ainda não funcionam.
81|You should clean these boots before wearing them.|Il faudrait nettoyer ces bottes avant de les porter.|É melhor limpar estas botas antes de usá-las.
82|Simple cotton tabi boots.|De simples bottes tabi en coton.|Botas tabi simples de algodão.
84|Shoes woven from wool.|Des chaussures tissées en laine.|Sapatos tecidos em lã.
85|Loafers made of thick tanned leather.|Des mocassins en cuir tanné épais.|Mocassins de couro curtido grosso.
87|Tabi boots so clean they shine!|Des bottes tabi si propres qu'elles brillent !|Botas tabi tão limpas que brilham!
88|Sandals carved from wood.|Des sandales taillées dans le bois.|Sandálias esculpidas em madeira.
89|Sneakers... for sneaking around!|Des baskets... pour filer en douce !|Tênis... para andar na surdina!
91|Sandals carved from stone.|Des sandales taillées dans la pierre.|Sandálias esculpidas em pedra.
92|These are expensive shoes!|Ce sont des chaussures coûteuses !|Estes sapatos são caros!
93|A mysterious supernatural aura surrounds these sandals.|Une mystérieuse aura surnaturelle entoure ces sandales.|Uma aura sobrenatural misteriosa envolve estas sandálias.
94|Leather boots covered in bronze plates.|Des bottes en cuir couvertes de plaques de bronze.|Botas de couro cobertas de placas de bronze.
95|Shin guards made of iron.|Des protège-tibias en fer.|Caneleiras feitas de ferro.
97|These flippers help you fish better.|Ces palmes vous aident à mieux pêcher.|Estas nadadeiras ajudam você a pescar melhor.
98|Shoes so clean they shine!|Des chaussures si propres qu'elles brillent !|Sapatos tão limpos que brilham!
99|Boots made of silver.|Des bottes en argent.|Botas feitas de prata.
100|They look like silver boots, but the silver paint is peeling.|Elles ressemblent à des bottes en argent, mais la peinture s'écaille.|Parecem botas de prata, mas a tinta prateada está descascando.
101|Magic boots that make Super Saiyan transformations last longer.|Des bottes magiques qui prolongent les transformations en Super Saiyan.|Botas mágicas que prolongam as transformações em Super Saiyajin.
103|Boots made of gold.|Des bottes en or.|Botas feitas de ouro.
104|You can feel energy flowing through these high-tech boots.|On sent l'énergie circuler dans ces bottes technologiques.|É possível sentir a energia fluindo por estas botas tecnológicas.
105|Powerful high-tech boots.|De puissantes bottes technologiques.|Botas tecnológicas poderosas.
107|Boots like those once worn by the Saiyans.|Des bottes semblables à celles que portaient les Saiyans.|Botas como as que os saiyajins usavam.
108|Boots so clean they shine!|Des bottes si propres qu'elles brillent !|Botas tão limpas que brilham!
109|These winged sandals make you walk and run faster.|Ces sandales ailées vous font marcher et courir plus vite.|Estas sandálias aladas fazem você andar e correr mais rápido.
110|These soccer boots have plenty of kick!|Ces chaussures de football ont du répondant !|Estas chuteiras têm muita força no chute!
111|Tabi boots made of Geromantium.|Des bottes tabi en géromantium.|Botas tabi feitas de geromântio.
113|You should clean this cape before wearing it.|Il faudrait laver cette cape avant de la porter.|É melhor lavar esta capa antes de usá-la.
114|You should clean this belt before wearing it.|Il faudrait nettoyer cette ceinture avant de la porter.|É melhor limpar este cinto antes de usá-lo.
115|An extremely expensive wristwatch.|Une montre-bracelet extrêmement coûteuse.|Um relógio de pulso extremamente caro.
116|A white karate belt.|Une ceinture blanche de karaté.|Uma faixa branca de caratê.
117|Very tacky sunglasses.|Des lunettes de soleil vraiment tape-à-l'œil.|Óculos de sol muito cafonas.
118|Drinks taste better through this ancient straw.|Les boissons sont meilleures avec cette paille antique.|As bebidas ficam mais saborosas com este canudo ancestral.
119|Food tastes better with these chopsticks.|Les aliments sont meilleurs avec ces baguettes.|A comida fica mais saborosa com estes hashis.
120|A thick cap knitted from wool.|Un bonnet épais tricoté en laine.|Um gorro grosso tecido em lã.
121|This charm brings you good luck!|Cette amulette vous porte chance !|Este amuleto traz boa sorte!
122|An armored samurai mask made of stone.|Un masque de samouraï blindé en pierre.|Uma máscara blindada de samurai feita de pedra.
123|A charm made of quartz.|Une amulette en quartz.|Um amuleto feito de quartzo.
124|A yellow karate belt.|Une ceinture jaune de karaté.|Uma faixa amarela de caratê.
125|A charm made of topaz.|Une amulette en topaze.|Um amuleto feito de topázio.
126|Only a truly ruthless criminal would wear this.|Seul un criminel vraiment impitoyable porterait cela.|Só um criminoso realmente impiedoso usaria isto.
127|A red karate belt.|Une ceinture rouge de karaté.|Uma faixa vermelha de caratê.
128|A frightening-looking mask.|Un masque à l'aspect terrifiant.|Uma máscara de aparência assustadora.
129|This classy monocle gives you plenty of charisma.|Ce monocle distingué vous donne beaucoup de charisme.|Este monóculo elegante dá muito carisma.
130|A charm made of amethyst.|Une amulette en améthyste.|Um amuleto feito de ametista.
131|It looks like a rabbit's foot... but it is not real.|Cela ressemble à une patte de lapin... mais elle est fausse.|Parece um pé de coelho... mas não é de verdade.
132|A green karate belt.|Une ceinture verte de karaté.|Uma faixa verde de caratê.
133|This snorkel helps you fish better.|Ce tuba vous aide à mieux pêcher.|Este snorkel ajuda você a pescar melhor.
134|A cape so clean it shines!|Une cape si propre qu'elle brille !|Uma capa tão limpa que brilha!
135|Protects against the undead.|Protège contre les morts-vivants.|Protege contra mortos-vivos.
136|This rabbit's foot brings you good luck!|Cette patte de lapin vous porte chance !|Este pé de coelho traz boa sorte!
137|A charm made of sapphire.|Une amulette en saphir.|Um amuleto feito de safira.
138|An evil aura surrounds this ring...|Une aura maléfique entoure cette bague...|Uma aura maligna envolve este anel...
139|How much blacker could this cape be? None.|Cette cape pourrait-elle être plus noire ? Impossible.|Esta capa poderia ser mais preta? Impossível.
140|A magic cape that makes Super Saiyan transformations last longer.|Une cape magique qui prolonge les transformations en Super Saiyan.|Uma capa mágica que prolonga as transformações em Super Saiyajin.
141|This talisman restores more energy during melee attacks.|Ce talisman rend plus d'énergie lors des attaques au corps à corps.|Este talismã recupera mais energia em ataques corpo a corpo.
142|A charm made of emerald.|Une amulette en émeraude.|Um amuleto feito de esmeralda.
143|An evil aura surrounds this charm...|Une aura maléfique entoure cette amulette...|Uma aura maligna envolve este amuleto...
144|A very ridiculous kazoo.|Un kazoo vraiment ridicule.|Um kazoo muito ridículo.
145|A traditional samurai helmet made of iron.|Un casque traditionnel de samouraï en fer.|Um capacete tradicional de samurai feito de ferro.
146|A Viking-style hat often worn by the Ox-King.|Un chapeau de style viking que porte souvent le roi Gyumao.|Um chapéu de estilo viking usado pelo Rei Cutelo.
147|This talisman's power comes at a terrible cost.|Le pouvoir de ce talisman a un prix terrible.|O poder deste talismã tem um custo terrível.
148|This pendant's crystals strengthen energy attacks.|Les cristaux de ce pendentif renforcent les attaques d'énergie.|Os cristais deste pingente fortalecem os ataques de energia.
149|A blue karate belt.|Une ceinture bleue de karaté.|Uma faixa azul de caratê.
150|Mercury's legendary cap.|La casquette légendaire de Mercure.|O lendário boné de Mercúrio.
151|This four-leaf clover brings you good luck!|Ce trèfle à quatre feuilles vous porte chance !|Este trevo de quatro folhas traz boa sorte!
152|This cape restores HP instead of energy during melee attacks.|Cette cape rend des PV plutôt que de l'énergie au corps à corps.|Esta capa recupera PV em vez de energia em ataques corpo a corpo.
153|This ring makes you stronger when you are close to death.|Cette bague vous rend plus fort quand vous êtes près de la mort.|Este anel deixa você mais forte quando está perto da morte.
154|A brown karate belt.|Une ceinture marron de karaté.|Uma faixa marrom de caratê.
155|A charm made of ruby.|Une amulette en rubis.|Um amuleto feito de rubi.
156|An ancient statuette inscribed in a forgotten language.|Une statuette antique gravée dans une langue oubliée.|Uma estatueta antiga gravada em uma língua esquecida.
157|A black karate belt.|Une ceinture noire de karaté.|Uma faixa preta de caratê.
158|A charm made of diamond.|Une amulette en diamant.|Um amuleto feito de diamante.
159|A belt so clean it shines!|Une ceinture si propre qu'elle brille !|Um cinto tão limpo que brilha!
160|A bandana made of Geromantium.|Un bandana en géromantium.|Uma bandana feita de geromântio.
161|Wear this hat while leveling up to earn a bonus!|Portez ce chapeau en montant de niveau pour obtenir un bonus !|Use este chapéu ao subir de nível para ganhar um bônus!
`);

rows('inventoryName', `
0|Miso Soup|Soupe miso|Sopa de missô
1|Rice Ball|Boule de riz|Bolinho de arroz
2|Chicken Leg|Cuisse de poulet|Coxa de frango
3|Hamburger|Hamburger|Hambúrguer
4|Onigiri|Onigiri|Onigiri
5|Curry Plate|Assiette de curry|Prato de curry
6|Turkey|Dinde|Peru
7|Steak|Steak|Bife
8|Three-Course Meal|Repas trois plats|Refeição de três pratos
9|Dinosaur Tail|Queue de dinosaure|Cauda de dinossauro
10|Milk|Lait|Leite
11|Tea|Thé|Chá
12|Soda|Soda|Refrigerante
13|Vanilla Soda|Soda à la vanille|Refrigerante de baunilha
14|Cherry Soda|Soda à la cerise|Refrigerante de cereja
15|Root Beer|Soda de racine|Refrigerante de raiz
16|Hercule-Ade|Hercule-Ade|Hercule-Ade
17|Elixir|Élixir|Elixir
18|Super Elixir|Super élixir|Superelixir
19|Dinosaur Milk|Lait de dinosaure|Leite de dinossauro
20|Sacred Water|Eau sacrée|Água sagrada
21|Senzu Bean|Haricot Senzu|Semente dos Deuses
22|Capsule|Capsule|Cápsula
23|Lazarus Crystal|Cristal de Lazare|Cristal de Lázaro
24|Food|Nourriture|Alimentos
25|White Bottle|Flacon blanc|Frasco branco
33|Key|Clé|Chave
34|Blue Accessory|Accessoire bleu|Acessório azul
37|Device|Appareil|Dispositivo
38|Gray Device|Appareil gris|Dispositivo cinza
39|Gold Object|Objet doré|Objeto dourado
40|Gray Device|Appareil gris|Dispositivo cinza
41|Gray Device|Appareil gris|Dispositivo cinza
42|Special Boot|Botte spéciale|Bota especial
`);
for (let id = 26; id <= 32; id++) rows('inventoryName', `${id}|Dragon Ball (index ${id})|Dragon Ball (indice ${id})|Esfera do Dragão (índice ${id})`);
for (const id of [35,36]) {
    const padded = String(id).padStart(3, '0');
    rows('inventoryName', `${id}|Item ${padded} (unverified)|Objet ${padded} (à vérifier)|Item ${padded} (a verificar)`);
}
for (let id = 43; id < 83; id++) {
    const padded = String(id).padStart(3, '0');
    rows('inventoryName', `${id}|Collectible ${padded} (unidentified)|Objet de collection ${padded} (non identifié)|Colecionável ${padded} (não identificado)`);
}
const hp = [20,40,80,120,200,400,800,600,1100,1500];
for (let id = 0; id < hp.length; id++) rows('inventoryDescription', `${id}|Restores ${hp[id]} HP.|Rend ${hp[id]} PV.|Recupera ${hp[id]} PV.`);
const energy = [20,40,80,125,175,250,350,500,750,2500];
for (let index = 0; index < energy.length; index++) rows('inventoryDescription', `${index + 10}|Restores ${energy[index]} energy points.|Rend ${energy[index]} points d'énergie.|Recupera ${energy[index]} pontos de energia.`);
rows('inventoryDescription', `
20|Raises attributes for 30 seconds.|Augmente les attributs pendant 30 secondes.|Aumenta os atributos por 30 segundos.
21|Fully restores health and energy.|Restaure entièrement la santé et l'énergie.|Restaura toda a saúde e energia.
22|A mysterious capsule with unknown contents.|Une capsule mystérieuse au contenu inconnu.|Uma cápsula misteriosa de conteúdo desconhecido.
23|Automatically revives the character when knocked out.|Ranime automatiquement le personnage s'il est K.-O.|Revive automaticamente o personagem se ele for nocauteado.
`);

rows('skill', `
1|Explosive Burst|Rafale explosive|Rajada explosiva
2|Big Bang|Big Bang|Big Bang
3|Big Bang Kamehameha|Big Bang Kamehameha|Big Bang Kamehameha
4|Burning Attack|Attaque brûlante|Ataque ardente
5|Dragon Fist Explosion|Explosion du poing du dragon|Explosão do punho do dragão
6|Electric Kamehameha|Kamehameha électrique|Kamehameha elétrico
7|Energy Blast|Vague d'énergie|Rajada de energia
8|Energy Punch|Poing d'énergie|Punho de energia
9|Energy Sword|Épée d'énergie|Espada de energia
10|Final Flash|Final Flash|Final Flash
11|Flaming Kamehameha|Kamehameha flamboyant|Kamehameha flamejante
12|Fusion Dance|Danse de la fusion|Dança da fusão
13|Kamikaze Ghosts|Fantômes kamikazes|Fantasmas kamikaze
14|Instant Transmission|Déplacement instantané|Teletransporte
15|Kamehameha|Kamehameha|Kamehameha
16|Kamekameha|Kamekameha|Kamekameha
17|Masenko|Masenko|Masenko
18|Saiyaman|Saiyaman|Saiyaman
19|Saiyaman|Saiyaman|Saiyaman
20|Super Saiyan|Super Saiyan|Super Saiyajin
21|Super Saiyan|Super Saiyan|Super Saiyajin
22|Super Saiyan 3|Super Saiyan 3|Super Saiyajin 3
23|Ultra Volleyball Attack|Attaque de volley-ball ultra|Ataque ultravioleibol
`);

rows('quest', `
0|Go to King Yemma's Castle.|Allez au château du roi Enma.|Vá ao castelo do Rei Enma.
1|Train with the Other World fighters.|Entraînez-vous avec les combattants de l'autre monde.|Treine com os lutadores do Outro Mundo.
2|Go to the Other World Tournament.|Allez au tournoi de l'autre monde.|Vá ao Torneio do Outro Mundo.
3|Attend class at Orange Star High School.|Allez en cours au lycée Orange Star.|Assista à aula na Escola Estrela Laranja.
4|Fly to West City and talk to Bulma.|Volez à la ville de l'Ouest et parlez à Bulma.|Voe até a Cidade do Oeste e fale com Bulma.
5|Fight crime in Hercule City.|Combattez le crime à Satan City.|Combata o crime na Cidade Satan.
6|Defeat the Red Shark Gang and save the mayor.|Battez le gang du Requin rouge et sauvez le maire.|Derrote a Gangue do Tubarão Vermelho e salve o prefeito.
7|Rescue Chobi from the circus.|Sauvez Chobi du cirque.|Salve Chobi do circo.
8|Tell your mother that Goku is returning.|Dites à votre mère que Goku va revenir.|Conte à sua mãe que Goku vai voltar.
9|Tell Piccolo and Dende that Goku is returning.|Dites à Piccolo et Dendé que Goku va revenir.|Conte a Piccolo e Dendê que Goku vai voltar.
10|Tell Bulma and Vegeta that Goku is returning.|Dites à Bulma et Vegeta que Goku va revenir.|Conte a Bulma e Vegeta que Goku vai voltar.
11|Tell Master Roshi and Krillin that Goku is returning.|Dites à Tortue Géniale et Krilin que Goku va revenir.|Conte ao Mestre Kame e Kuririn que Goku vai voltar.
12|Meet Goten in the East District woods to train.|Retrouvez Goten dans la forêt de l'Est pour vous entraîner.|Encontre Goten na floresta do leste para treinar.
13|Meet Bulma to go to the World Tournament.|Retrouvez Bulma pour aller au tournoi mondial.|Encontre Bulma para ir ao Torneio Mundial.
14|Sign up for the World Tournament.|Inscrivez-vous au tournoi mondial.|Inscreva-se no Torneio Mundial.
15|Go to Kami's Lookout and get a Senzu Bean from Korin.|Allez au palais de Kami et obtenez un haricot Senzu auprès de Karin.|Vá ao Templo de Kami e pegue uma Semente dos Deuses com Karin.
16|Find Babidi's spaceship.|Trouvez le vaisseau de Babidi.|Encontre a nave espacial de Babidi.
17|Enter Babidi's ship and defeat Dabura.|Entrez dans le vaisseau de Babidi et battez Dabra.|Entre na nave de Babidi e derrote Dabura.
18|Destroy Babidi's spaceship.|Détruisez le vaisseau de Babidi.|Destrua a nave espacial de Babidi.
19|Go to Kami's Lookout.|Allez au palais de Kami.|Vá ao Templo de Kami.
20|Get the Dragon Radar from Bulma.|Obtenez le radar des Dragon Balls auprès de Bulma.|Pegue o Radar do Dragão com Bulma.
21|Find the Dragon Balls.|Trouvez les Dragon Balls.|Encontre as Esferas do Dragão.
22|Find Vegeta in Hell.|Trouvez Vegeta en enfer.|Encontre Vegeta no inferno.
23|Defeat Janemba.|Battez Janemba.|Derrote Janemba.
24|Pull the Z Sword from the rock.|Retirez l'épée Z du rocher.|Retire a Espada Z da rocha.
25|Take a nap at Kami's Lookout.|Faites une sieste au palais de Kami.|Tire uma soneca no Templo de Kami.
26|Have Dr. Brief upgrade the Scouter at Capsule Corporation.|Faites améliorer le détecteur par le Dr Brief à Capsule Corporation.|Peça ao Dr. Brief para melhorar o rastreador na Corporação Cápsula.
27|Save Goten and Trunks from Super Buu.|Sauvez Goten et Trunks de Super Buu.|Salve Goten e Trunks de Super Boo.
28|Find Dende.|Trouvez Dendé.|Encontre Dendê.
29|Return and defeat Super Buu.|Revenez et battez Super Buu.|Volte e derrote Super Boo.
30|Find Gohan, Goten, Trunks and Piccolo.|Trouvez Gohan, Goten, Trunks et Piccolo.|Encontre Gohan, Goten, Trunks e Piccolo.
31|Escape from Buu.|Échappez-vous de Buu.|Fuja de Boo.
32|Go to the Barren Wasteland and defeat Kid Buu.|Allez aux terres arides et battez Petit Buu.|Vá ao deserto e derrote Kid Boo.
33|Get a root beer for the lighthouse keeper.|Apportez un soda de racine au gardien du phare.|Leve um refrigerante de raiz ao faroleiro.
34|Get a turkey for the lighthouse keeper.|Apportez une dinde au gardien du phare.|Leve um peru ao faroleiro.
35|Get Hercule-Ade for the lighthouse keeper.|Apportez de l'Hercule-Ade au gardien du phare.|Leve Hercule-Ade ao faroleiro.
36|Get an elixir for the lighthouse keeper.|Apportez un élixir au gardien du phare.|Leve um elixir ao faroleiro.
37|Get a dinosaur tail for the lighthouse keeper.|Apportez une queue de dinosaure au gardien du phare.|Leve uma cauda de dinossauro ao faroleiro.
38|Get a super elixir for the lighthouse keeper.|Apportez un super élixir au gardien du phare.|Leve um superelixir ao faroleiro.
39|Defeat airship bandits and get bandanas for the ninja.|Battez les bandits du dirigeable et obtenez des bandanas pour le ninja.|Derrote os bandidos da aeronave e consiga bandanas para o ninja.
`);

for (const [tag, catalog] of Object.entries(locales)) {
    for (const [kind, values] of Object.entries(source)) {
        if (catalog[kind].length !== values.length)
            throw new Error('Count mismatch: ' + tag + '/' + kind);
        for (let id = 0; id < values.length; id++) {
            if (typeof catalog[kind][id] !== 'string')
                throw new Error('Missing translation: ' + tag + '/' + kind + '/' + id);
            if ((catalog[kind][id] === '') !== (values[id] === ''))
                throw new Error('Unexpected empty translation: ' + tag + '/' + kind + '/' + id);
        }
    }
    fs.mkdirSync(path.join(root, 'i18n'), {recursive: true});
    fs.writeFileSync(path.join(root, 'i18n', 'content-' + tag + '.json'), JSON.stringify(catalog, null, 2) + '\n');
}
console.log('Complete menu catalogs generated for en, es, fr and pt-BR.');
